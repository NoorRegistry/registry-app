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
}: {
  qty: number;
  updateQty: (qty: number) => void;
}) {
  return (
    <View className="rounded-full px-2 py-1 bg-neutral-100 flex-row gap-4 items-center">
      <IconButton
        onPress={() => {
          qty !== 1 && updateQty(qty - 1);
        }}
        icon={qty === 1 ? <TrashIcon size={18} /> : <MinusIcon size={18} />}
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
