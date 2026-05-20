import React from "react";
import { useParams } from "react-router-dom";
import CategoryCollectionPage from "./CategoryCollectionPage";

const titleFromSlug = (slug = "") =>
  ({
    "display-and-touch": "Display & Touch",
    "volume-and-power-strips": "Volume And Power Strips",
  }[slug] || slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "));

const ProductCategory = () => {
  const { categorySlug } = useParams();
  const title = titleFromSlug(categorySlug);

  return (
    <CategoryCollectionPage
      title={title}
      category={title}
      emptyMessage={`No products are available in ${title} right now.`}
    />
  );
};

export default ProductCategory;
