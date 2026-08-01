"""Serve and register the bundled Lovelace card.

HACS keys repositories by full name rather than by (name, category), so one
repository gets exactly one category and cannot be installed as both an
integration and a dashboard plugin. This integration therefore ships the card
itself: it serves `frontend/` over HTTP and adds its own Lovelace resource, the
same approach ha-bambulab takes.
"""
from __future__ import annotations

import logging
import pathlib

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import CARD_FILENAME, CARD_VERSION, URL_BASE

_LOGGER = logging.getLogger(__name__)

CARD_URL = f"{URL_BASE}/{CARD_FILENAME}"
VERSIONED_CARD_URL = f"{CARD_URL}?v={CARD_VERSION}"

# Lovelace loads after config entries, so the resource list may not be ready yet.
_RETRY_SECONDS = 5


def _lovelace(hass: HomeAssistant):
    return hass.data.get("lovelace")


def _resource_mode(hass: HomeAssistant) -> str | None:
    """Storage vs YAML. Resources can only be managed in storage mode."""
    data = _lovelace(hass)
    if data is None:
        return None
    # `resource_mode` since 2026.2, `mode` before that; a dict in older releases.
    if isinstance(data, dict):
        return data.get("mode")
    return getattr(data, "resource_mode", None) or getattr(data, "mode", None)


def _resources(hass: HomeAssistant):
    data = _lovelace(hass)
    if data is None:
        return None
    return data.get("resources") if isinstance(data, dict) else getattr(data, "resources", None)


async def async_register(hass: HomeAssistant) -> None:
    """Serve the card, then register it as a Lovelace resource."""
    await _async_register_path(hass)

    if _resource_mode(hass) != "storage":
        # YAML-managed resources are the user's to edit; say what to add.
        _LOGGER.info(
            "Lovelace resources are managed in YAML — add this manually: %s",
            VERSIONED_CARD_URL,
        )
        return

    await _async_wait_for_resources(hass)


async def _async_register_path(hass: HomeAssistant) -> None:
    """Expose frontend/ at /polr_stocks/."""
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(pathlib.Path(__file__).parent / "frontend"), False)]
        )
    except RuntimeError:
        # Already registered — reloading the entry hits this every time.
        _LOGGER.debug("Static path %s already registered", URL_BASE)


async def _async_wait_for_resources(hass: HomeAssistant) -> None:
    async def check(_now=None) -> None:
        resources = _resources(hass)
        if resources is not None and resources.loaded:
            await _async_register_card(hass, resources)
        else:
            _LOGGER.debug("Lovelace resources not loaded yet; retrying")
            async_call_later(hass, _RETRY_SECONDS, check)

    await check()


async def _async_register_card(hass: HomeAssistant, resources) -> None:
    """Add the resource, or update it when the card version has moved on."""
    for resource in resources.async_items():
        url = str(resource.get("url", ""))
        if url.split("?")[0] != CARD_URL:
            continue
        if url == VERSIONED_CARD_URL:
            return
        _LOGGER.debug("Updating card resource to %s", VERSIONED_CARD_URL)
        await resources.async_update_item(
            resource.get("id"), {"res_type": "module", "url": VERSIONED_CARD_URL}
        )
        return

    _LOGGER.debug("Registering card resource %s", VERSIONED_CARD_URL)
    await resources.async_create_item({"res_type": "module", "url": VERSIONED_CARD_URL})


async def async_unregister(hass: HomeAssistant) -> None:
    """Drop the Lovelace resource when the integration is removed."""
    if _resource_mode(hass) != "storage":
        return
    resources = _resources(hass)
    if resources is None or not resources.loaded:
        return

    for resource in list(resources.async_items()):
        if str(resource.get("url", "")).split("?")[0] == CARD_URL:
            await resources.async_delete_item(resource.get("id"))
