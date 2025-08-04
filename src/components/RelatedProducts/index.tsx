import Typography from "@/components/Typography";
import { fetchRelatedProductById } from "@/services/products.service";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import ProductCard from "../ProductCard";

interface RelatedProductsProps {
  productId: string;
}

const RelatedProducts = ({ productId }: RelatedProductsProps) => {
  const { t } = useTranslation();

  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["relatedProducts", productId],
    queryFn: () => fetchRelatedProductById(productId),
    enabled: !!productId,
  });

  if (isLoading || !relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <View className="py-6">
      <View className="px-4 mb-4">
        <Typography.Text size="lg" weight="bold">
          {t("shop.relatedProducts")}
        </Typography.Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        className="flex-row"
      >
        {relatedProducts.map((product, index) => (
          <View
            key={product.id}
            style={{
              marginRight: index === relatedProducts.length - 1 ? 0 : 12,
            }}
          >
            <ProductCard product={product} width={140} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RelatedProducts;
