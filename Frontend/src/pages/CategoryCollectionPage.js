import React, { useCallback, useEffect, useState } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../features/products/productSlilce";
import "./OurStore.css";

const CategoryCollectionPage = ({
  title,
  category,
  categories,
  tag,
  defaultSort = null,
  emptyMessage = "No products found in this collection",
}) => {
  const [grid, setGrid] = useState(4);
  const [sort, setSort] = useState(defaultSort);
  const dispatch = useDispatch();
  const productState = useSelector((state) => state?.product?.product);
  const categoryFilter =
    Array.isArray(categories) && categories.length > 0 ? categories : category;

  const getProducts = useCallback(() => {
    dispatch(getAllProducts({ category: categoryFilter, tag, sort }));
  }, [categoryFilter, dispatch, sort, tag]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
    <>
      <Meta title={`${title} | Shree Mobile`} />
      <div className="store-page-wrapper">
        <BreadCrumb title={title} />

        <Container class1="store-container">
          <div className="store-content category-store-content">
            <div className="store-toolbar">
              <div className="toolbar-left">
                <span className="results-count">
                  {productState?.length || 0} Products
                </span>
                <span className="active-filter">{title}</span>
              </div>

              <div className="toolbar-right">
                <div className="sort-dropdown">
                  <select
                    value={sort || ""}
                    onChange={(e) => setSort(e.target.value || defaultSort)}
                  >
                    <option value="">Sort By</option>
                    <option value="title">Name A-Z</option>
                    <option value="-title">Name Z-A</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                  </select>
                </div>

                <div className="grid-controls">
                  <button
                    className={`grid-btn ${grid === 3 ? "active" : ""}`}
                    onClick={() => setGrid(3)}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                  <button
                    className={`grid-btn ${grid === 4 ? "active" : ""}`}
                    onClick={() => setGrid(4)}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                  <button
                    className={`grid-btn ${grid === 6 ? "active" : ""}`}
                    onClick={() => setGrid(6)}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="products-grid-wrapper category-products-grid">
              <ProductCard data={productState ? productState : []} grid={grid} />
            </div>

            {(!productState || productState.length === 0) && (
              <div className="no-products">
                <div className="no-products-icon">◇</div>
                <h3>No Products Found</h3>
                <p>{emptyMessage}</p>
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default CategoryCollectionPage;
