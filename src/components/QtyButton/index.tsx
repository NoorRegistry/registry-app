import React from "react";
import { View } from "react-native";
import { IconButton } from "../Button";
import Typography from "../Typography";
import { MinusIcon } from "../icons/minus";
import { PlusIcon } from "../icons/plus";
import { TrashIcon } from "../icons/trash";

function QtyButton({
  qty,
  updateQty,
  onDelete,
  min = 1,
}: {
  qty: number;
  updateQty: (qty: number) => void;
  onDelete?: () => void;
  min?: number;
}) {
  return (
    <View className="rounded-full px-2 py-1 bg-neutral-100 flex-row gap-4 items-center">
      <IconButton
        onPress={() => {
          if (qty === 1 && onDelete) onDelete();
          else if (qty > min) updateQty(qty - 1);
        }}
        disabled={qty <= min && !(qty === 1 && onDelete)}
        accessibilityLabel={
          qty === 1 && onDelete ? "Remove item" : "Decrease quantity"
        }
        icon={
          qty === 1 && onDelete ? (
            <TrashIcon size={18} />
          ) : (
            <MinusIcon size={18} />
          )
        }
      />
      <Typography.Text size="sm">{qty}</Typography.Text>
      <IconButton
        onPress={() => {
          updateQty(qty + 1);
        }}
        icon={<PlusIcon size={18} />}
      />
    </View>
  );
}

export default QtyButton;
