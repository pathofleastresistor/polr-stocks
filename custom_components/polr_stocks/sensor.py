"""One price sensor per configured ticker."""
from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import StocksCoordinator
from .quote import Quote


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up a sensor for every symbol on the watchlist."""
    coordinator: StocksCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        StockPriceSensor(coordinator, symbol) for symbol in coordinator.symbols
    )


class StockPriceSensor(CoordinatorEntity[StocksCoordinator], SensorEntity):
    """Last traded price for one symbol."""

    _attr_has_entity_name = False
    _attr_device_class = SensorDeviceClass.MONETARY
    # No state_class: HA rejects `measurement` alongside `monetary`, and `total`
    # would have the recorder generate sum statistics for a price that is not
    # cumulative. State history is still recorded either way.
    _attr_native_unit_of_measurement = "USD"
    _attr_suggested_display_precision = 2
    _attr_icon = "mdi:chart-line"

    def __init__(self, coordinator: StocksCoordinator, symbol: str) -> None:
        super().__init__(coordinator)
        self._symbol = symbol
        self._attr_unique_id = f"{DOMAIN}_{symbol.lower()}"
        self._attr_name = symbol
        # Keeps entity ids predictable (sensor.polr_stocks_googl) regardless of
        # what the friendly name gets changed to later.
        self.entity_id = f"sensor.{DOMAIN}_{symbol.lower()}"

    @property
    def _quote(self) -> Quote | None:
        return (self.coordinator.data or {}).get(self._symbol)

    @property
    def available(self) -> bool:
        return super().available and self._quote is not None

    @property
    def native_value(self) -> float | None:
        quote = self._quote
        return None if quote is None else quote.price

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        quote = self._quote
        if quote is None:
            return {"symbol": self._symbol}
        return {
            "symbol": quote.symbol,
            "change": quote.change,
            "change_percent": quote.change_percent,
            "previous_close": quote.previous_close,
            "open": quote.open,
            "high": quote.high,
            "low": quote.low,
            "quoted_at": quote.quoted_at,
        }
