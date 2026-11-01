import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { eventDateValue, formatEventDate } from "@/utils/event-date";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Keyboard, Modal, Pressable, View } from "react-native";

export default function EventDateField({
  value,
  onChange,
  disabled = false,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const first = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
  );
  const days = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const shift = (n: number) =>
    setMonth(
      new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1)),
    );
  const close = () => setOpen(false);
  return (
    <View style={{ gap: 6 }}>
      <CommerceText weight="medium">{t("homeDesign.eventDate")}</CommerceText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        }}
      >
        <Pressable
          testID="event-date-field"
          accessibilityRole="button"
          accessibilityLabel={t("homeDesign.eventDate")}
          disabled={disabled}
          onPress={() => {
            Keyboard.dismiss();
            setMonth(
              value && eventDateValue(value)
                ? new Date(`${value.slice(0, 10)}T00:00:00Z`)
                : new Date(),
            );
            setOpen(true);
          }}
          style={{
            flex: 1,
            minHeight: 48,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Feather name="calendar" size={19} color={C.deep} />
          <CommerceText style={{ flex: 1, color: value ? C.ink : C.muted }}>
            {value
              ? formatEventDate(value, i18n.language, true)
              : t("homeDesign.optional")}
          </CommerceText>
        </Pressable>
        {!!value && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("homeDesign.clearDate")}
            disabled={disabled}
            onPress={() => onChange(null)}
            style={{ padding: 12 }}
          >
            <Feather name="x" size={19} color={C.muted} />
          </Pressable>
        )}
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000066",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={close}
            accessibilityLabel={t("common.cancel")}
            style={{ position: "absolute", inset: 0 }}
          />
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: "white",
              padding: 18,
              borderRadius: 20,
              width: "100%",
              maxWidth: 420,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("homeDesign.previousMonth")}
                onPress={() => shift(-1)}
                style={{ padding: 12 }}
              >
                <Feather
                  name={I18nManager.isRTL ? "chevron-right" : "chevron-left"}
                  size={22}
                  color={C.deep}
                />
              </Pressable>
              <CommerceText weight="medium">
                {first.toLocaleDateString(i18n.language, {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </CommerceText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("homeDesign.nextMonth")}
                onPress={() => shift(1)}
                style={{ padding: 12 }}
              >
                <Feather
                  name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
                  size={22}
                  color={C.deep}
                />
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from({ length: 7 }, (_, day) => (
                <View
                  key={`weekday-${day}`}
                  style={{ width: "14.2857%", paddingVertical: 8 }}
                >
                  <CommerceText
                    size="xs"
                    style={{ textAlign: "center", color: C.muted }}
                  >
                    {new Date(Date.UTC(2026, 0, 4 + day)).toLocaleDateString(
                      i18n.language,
                      { weekday: "short", timeZone: "UTC" },
                    )}
                  </CommerceText>
                </View>
              ))}
              {Array.from({ length: first.getUTCDay() + days }, (_, index) => {
                const day = index - first.getUTCDay() + 1;
                const date = new Date(
                  Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day),
                )
                  .toISOString()
                  .slice(0, 10);
                const selected = date === eventDateValue(value);
                return day < 1 ? (
                  <View key={index} style={{ width: "14.2857%" }} />
                ) : (
                  <Pressable
                    key={index}
                    accessibilityRole="button"
                    accessibilityLabel={formatEventDate(
                      date,
                      i18n.language,
                      true,
                    )}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(date);
                      close();
                    }}
                    style={{
                      width: "14.2857%",
                      minHeight: 44,
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor: selected ? C.primary : "white",
                      borderRadius: 22,
                    }}
                  >
                    <CommerceText style={{ color: selected ? "white" : C.ink }}>
                      {day.toLocaleString(i18n.language)}
                    </CommerceText>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={{ alignSelf: "flex-end", padding: 14, marginTop: 8 }}
            >
              <CommerceText style={{ color: C.deep }}>
                {t("common.cancel")}
              </CommerceText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
