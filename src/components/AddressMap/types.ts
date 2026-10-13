export type AddressPin = { latitude: number; longitude: number };
export type AddressMapProps = {
  pin: AddressPin | null;
  onSelect: (pin: AddressPin) => void;
  height: number;
  interactive?: boolean;
  onMoving?: (moving: boolean) => void;
};
