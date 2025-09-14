import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AntDesign } from "@expo/vector-icons";

const Header = () => {
  const { user } = useUser();

  return (
    <View className="flex-row justify-between items-center py-4 sticky top-0">
      <View className="flex-row items-center gap-3">
        <Image
          source={{
            uri: "https://my-finance-pi-jade.vercel.app/_next/image?url=%2Ffavicon.ico&w=1920&q=75",
          }}
          contentFit="cover"
          transition={300}
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
          }}
        />
        <View>
          <Text className="dark:text-white text-xl font-black">My Finance</Text>
          <Text className="dark:text-zinc-300 text-sm mt-0.5">
            Olá, {user?.firstName || "Usuário"}
          </Text>
        </View>
      </View>

      <Link href="/profile" asChild>
        <Pressable className="mt-8 items-center gap-1">
          <Image
            source={{ uri: user?.imageUrl }}
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              borderWidth: 1,
            }}
            contentFit="cover"
            transition={300}
          />
          <AntDesign name="down" size={16} color="white" />
        </Pressable>
      </Link>
    </View>
  );
};

export default Header;
