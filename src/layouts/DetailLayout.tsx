import { View } from "react-native";
import { Header } from "../components/layout/Header";

type DetailLayoutProps = {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
};

export function DetailLayout({ title, onBack, rightAction, children }: DetailLayoutProps) {
  return (
    <View className="flex-1 mt-3  bg-gray-50"  style={{ height: "100%" }}>
      <Header 
        title={title} 
        onBackPress={onBack} 
        rightAction={rightAction}
        variant="white"
      />
      <View className="flex-1 mb-2" style={{ minHeight: 2 }}>
        {children}
      </View>
    </View>
  );
}