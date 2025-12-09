import { MaterialIcons } from "@expo/vector-icons";
import {
  addMonths,
  format,
  isSameMonth,
  isSameYear,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Button, Divider, Menu } from "react-native-paper";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDateChange = (months: number) => {
    const newDate =
      months > 0
        ? addMonths(selectedDate, months)
        : subMonths(selectedDate, Math.abs(months));
    onDateChange(newDate);
  };

  const resetToCurrentMonth = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return isSameMonth(selectedDate, now) && isSameYear(selectedDate, now);
  };

  const monthsOptions = [...Array(12)].map((_, i) => {
    const date = subMonths(new Date(), i);
    return {
      label: format(date, "MMMM yyyy", { locale: ptBR }),
      value: date.toISOString(),
    };
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dateSelectorContainer,
          colorScheme === "dark" ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        {/* Previous Month Button */}
        <TouchableOpacity
          style={[
            styles.button,
            colorScheme === "dark" ? styles.darkButton : styles.lightButton,
          ]}
          onPress={() => handleDateChange(-1)}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>

        {/* Month Selector */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.monthSelector,
                colorScheme === "dark"
                  ? styles.darkMonthSelector
                  : styles.lightMonthSelector,
              ]}
              onPress={() => setMenuVisible(true)}
            >
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={colorScheme === "dark" ? "#fff" : "#000"}
                style={styles.calendarIcon}
              />
              <Text
                style={[
                  styles.monthText,
                  { color: colorScheme === "dark" ? "#fff" : "#000" },
                ]}
              >
                {format(selectedDate, "MMM yyyy", { locale: ptBR })}
              </Text>
            </TouchableOpacity>
          }
          contentStyle={[
            styles.menuContent,
            colorScheme === "dark" ? styles.darkMenu : styles.lightMenu,
          ]}
        >
          <Text
            style={[
              styles.menuTitle,
              { color: colorScheme === "dark" ? "#fff" : "#000" },
            ]}
          >
            Selecionar mês
          </Text>
          <Divider />
          {monthsOptions.map((month) => (
            <Menu.Item
              key={month.value}
              onPress={() => {
                onDateChange(new Date(month.value));
                setMenuVisible(false);
              }}
              title={month.label}
              titleStyle={{
                color: colorScheme === "dark" ? "#fff" : "#000",
              }}
            />
          ))}
        </Menu>

        {/* Next Month Button */}
        <TouchableOpacity
          style={[
            styles.button,
            colorScheme === "dark" ? styles.darkButton : styles.lightButton,
          ]}
          onPress={() => handleDateChange(1)}
        >
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {/* Current Month Button */}
      {!isCurrentMonth() && (
        <Button
          mode="outlined"
          onPress={resetToCurrentMonth}
          style={styles.currentMonthButton}
          labelStyle={styles.currentMonthText}
        >
          Mês atual
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#fafafa",
    borderColor: "#e4e4e7",
  },
  darkContainer: {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lightButton: {
    backgroundColor: "transparent",
  },
  darkButton: {
    backgroundColor: "transparent",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: "center",
  },
  lightMonthSelector: {
    backgroundColor: "transparent",
  },
  darkMonthSelector: {
    backgroundColor: "transparent",
  },
  calendarIcon: {
    marginRight: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: "500",
  },
  menuContent: {
    borderRadius: 8,
    maxHeight: 300,
  },
  lightMenu: {
    backgroundColor: "#fff",
  },
  darkMenu: {
    backgroundColor: "#18181b",
  },
  menuTitle: {
    padding: 12,
    fontWeight: "600",
    fontSize: 14,
  },
  currentMonthButton: {
    borderColor: "#e4e4e7",
  },
  currentMonthText: {
    fontSize: 12,
  },
});

export default DateSelector;
