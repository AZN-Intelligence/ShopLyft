export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string;
  size?: string;
  notes?: string;
}

export type FormStep =
  | "items"
  | "details"
  | "confirm"
  | "location"
  | "loading"
  | "plan";

export interface LocationData {
  lat: number;
  lng: number;
}

export interface StepHeaderProps {
  title: string;
  description: string;
}

export interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  backText?: string;
  nextText: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export interface ItemSelectionGridProps {
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  label?: string;
}

export interface CustomInputToggleProps {
  showDetails: boolean;
  onToggle: (show: boolean) => void;
  customInput: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
  tip?: string;
}

export interface LocationSelectorProps {
  useCurrentLocation: boolean;
  onLocationOptionChange: (useCurrent: boolean) => void;
  currentLocation: LocationData | null;
  manualLocation: string;
  onManualLocationChange: (value: string) => void;
}
