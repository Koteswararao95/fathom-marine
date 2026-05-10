from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Dict, List, Optional


@dataclass
class TrackableItem:
    name: str
    due_date: date
    completed_on: Optional[date] = None

    @property
    def is_completed(self) -> bool:
        return self.completed_on is not None

    def is_overdue(self, as_of: date) -> bool:
        return not self.is_completed and self.due_date < as_of


@dataclass
class CrewActivity:
    crew_member_id: str
    activity_type: str
    details: str
    timestamp: datetime


@dataclass
class ShipRecord:
    maintenance: Dict[str, TrackableItem] = field(default_factory=dict)
    drills: Dict[str, TrackableItem] = field(default_factory=dict)
    compliance: Dict[str, TrackableItem] = field(default_factory=dict)
    crew_activities: List[CrewActivity] = field(default_factory=list)


class MaritimeOperationsComplianceSystem:
    def __init__(self) -> None:
        self._ships: Dict[str, ShipRecord] = {}

    def register_ship(self, ship_id: str) -> None:
        if ship_id in self._ships:
            raise ValueError(f"Ship '{ship_id}' is already registered.")
        self._ships[ship_id] = ShipRecord()

    def schedule_maintenance(self, ship_id: str, task_name: str, due_date: date) -> None:
        self._add_trackable(self._ship(ship_id).maintenance, task_name, due_date)

    def complete_maintenance(self, ship_id: str, task_name: str, completed_on: Optional[date] = None) -> None:
        self._complete_item(self._ship(ship_id).maintenance, task_name, completed_on)

    def schedule_safety_drill(self, ship_id: str, drill_name: str, due_date: date) -> None:
        self._add_trackable(self._ship(ship_id).drills, drill_name, due_date)

    def complete_safety_drill(self, ship_id: str, drill_name: str, completed_on: Optional[date] = None) -> None:
        self._complete_item(self._ship(ship_id).drills, drill_name, completed_on)

    def add_compliance_requirement(self, ship_id: str, requirement_name: str, due_date: date) -> None:
        self._add_trackable(self._ship(ship_id).compliance, requirement_name, due_date)

    def complete_compliance_requirement(
        self, ship_id: str, requirement_name: str, completed_on: Optional[date] = None
    ) -> None:
        self._complete_item(self._ship(ship_id).compliance, requirement_name, completed_on)

    def log_crew_activity(
        self,
        ship_id: str,
        crew_member_id: str,
        activity_type: str,
        details: str = "",
        timestamp: Optional[datetime] = None,
    ) -> None:
        self._ship(ship_id).crew_activities.append(
            CrewActivity(
                crew_member_id=crew_member_id,
                activity_type=activity_type,
                details=details,
                timestamp=timestamp or datetime.utcnow(),
            )
        )

    def ship_status(self, ship_id: str, as_of: Optional[date] = None) -> dict:
        current_date = as_of or date.today()
        ship = self._ship(ship_id)

        overdue_maintenance = sum(1 for item in ship.maintenance.values() if item.is_overdue(current_date))
        overdue_drills = sum(1 for item in ship.drills.values() if item.is_overdue(current_date))
        overdue_compliance = sum(1 for item in ship.compliance.values() if item.is_overdue(current_date))

        return {
            "ship_id": ship_id,
            "maintenance": self._category_status(ship.maintenance, current_date),
            "drills": self._category_status(ship.drills, current_date),
            "compliance": self._category_status(ship.compliance, current_date),
            "overdue_total": overdue_maintenance + overdue_drills + overdue_compliance,
            "crew_activity_count": len(ship.crew_activities),
        }

    def fleet_compliance_score(self, as_of: Optional[date] = None) -> float:
        current_date = as_of or date.today()
        total_due = 0
        completed_due = 0

        for ship in self._ships.values():
            for collection in (ship.maintenance, ship.drills, ship.compliance):
                for item in collection.values():
                    if item.due_date <= current_date:
                        total_due += 1
                        if item.is_completed and item.completed_on and item.completed_on <= current_date:
                            completed_due += 1

        if total_due == 0:
            return 100.0
        return round((completed_due / total_due) * 100, 2)

    def _ship(self, ship_id: str) -> ShipRecord:
        try:
            return self._ships[ship_id]
        except KeyError as exc:
            raise ValueError(f"Ship '{ship_id}' is not registered.") from exc

    @staticmethod
    def _add_trackable(collection: Dict[str, TrackableItem], item_name: str, due_date: date) -> None:
        if item_name in collection:
            raise ValueError(f"Item '{item_name}' already exists.")
        collection[item_name] = TrackableItem(name=item_name, due_date=due_date)

    @staticmethod
    def _complete_item(collection: Dict[str, TrackableItem], item_name: str, completed_on: Optional[date]) -> None:
        if item_name not in collection:
            raise ValueError(f"Item '{item_name}' does not exist.")
        collection[item_name].completed_on = completed_on or date.today()

    @staticmethod
    def _category_status(collection: Dict[str, TrackableItem], as_of: date) -> dict:
        completed = sum(1 for item in collection.values() if item.is_completed)
        total = len(collection)
        overdue = sum(1 for item in collection.values() if item.is_overdue(as_of))
        return {
            "total": total,
            "completed": completed,
            "pending": total - completed,
            "overdue": overdue,
        }
