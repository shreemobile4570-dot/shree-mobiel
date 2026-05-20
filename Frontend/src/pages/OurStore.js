import React, { useCallback, useEffect, useState } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../features/products/productSlilce";
import "./OurStore.css";

const OurStore = () => {
  const [grid, setGrid] = useState(4);
  const productState = useSelector((state) => state?.product?.product);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [tags, setTags] = useState([]);

  //filter state
  const [tag, setTag] = useState(null);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [minPrice, setminPrice] = useState(null);
  const [maxPrice, setmaxPrice] = useState(null);
  const [sort, setSort] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let newBrands = [];
    let category = [];
    let newtags = [];

    for (let index = 0; index < productState?.length; index++) {
      const element = productState[index];
      newBrands.push(element.brand);
      category.push(element.category);
      newtags.push(...(Array.isArray(element.tags) ? element.tags : [element.tags]));
    }
    setBrands(newBrands.filter(Boolean));
    setCategories(category.filter(Boolean));
    setTags(newtags.filter(Boolean));
  }, [productState]);

  const dispatch = useDispatch();
  const getProducts = useCallback(() => {
    dispatch(
      getAllProducts({ sort, tag, brand, category, minPrice, maxPrice })
    );
  }, [brand, category, dispatch, maxPrice, minPrice, sort, tag]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const clearFilters = () => {
    setTag(null);
    setCategory(null);
    setBrand(null);
    setminPrice(null);
    setmaxPrice(null);
  };

  return (
    <>
      <Meta title={"Our Store | Shree Mobile"} />
      <div className="store-page-wrapper">
        <BreadCrumb title="Shop" />
        
        <Container class1="store-container">
          {/* Mobile Filter Toggle */}
          <div className="filter-toggle-mobile">
            <button 
              className="filter-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span>☰</span> Filters
            </button>
          </div>

          <div className="row">
            {/* Filter Sidebar */}
            <div className={`col-lg-3 col-md-4 ${sidebarOpen ? 'sidebar-open' : ''}`}>
              <div className="filter-sidebar">
                <div className="filter-header">
                  <h3>Filters</h3>
                  {(tag || category || brand || minPrice || maxPrice) && (
                    <button className="clear-filters" onClick={clearFilters}>
                      Clear All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="filter-section">
                  <h4 className="filter-title">Categories</h4>
                  <ul className="filter-list">
                    <li 
                      className={`filter-item ${!category ? 'active' : ''}`}
                      onClick={() => setCategory(null)}
                    >
                      All Products
                    </li>
                    {categories &&
                      [...new Set(categories)].map((item, index) => {
                        return (
                          <li 
                            key={index} 
                            className={`filter-item ${category === item ? 'active' : ''}`}
                            onClick={() => setCategory(item)}
                          >
                            {item}
                          </li>
                        );
                      })}
                  </ul>
                </div>

                {/* Price Filter */}
                <div className="filter-section">
                  <h4 className="filter-title">Price Range</h4>
                  <div className="price-inputs">
                    <div className="price-field">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice || ''}
                        onChange={(e) => setminPrice(e.target.value)}
                      />
                    </div>
                    <span className="price-separator">—</span>
                    <div className="price-field">
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice || ''}
                        onChange={(e) => setmaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="filter-section">
                  <h4 className="filter-title">Collection</h4>
                  <div className="tag-filters">
                    {tags &&
                      [...new Set(tags)].map((item, index) => {
                        return (
                          <button
                            key={index}
                            onClick={() => setTag(tag === item ? null : item)}
                            className={`tag-btn ${tag === item ? 'active' : ''}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="filter-section">
                  <h4 className="filter-title">Brands</h4>
                  <div className="tag-filters">
                    {brands &&
                      [...new Set(brands)].map((item, index) => {
                        return (
                          <button
                            key={index}
                            onClick={() => setBrand(brand === item ? null : item)}
                            className={`tag-btn ${brand === item ? 'active' : ''}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="col-lg-9 col-md-8">
              <div className="store-content">
                {/* Sort and Grid Controls */}
                <div className="store-toolbar">
                  <div className="toolbar-left">
                    <span className="results-count">
                      {productState?.length} Products
                    </span>
                    {category && (
                      <span className="active-filter">
                        {category}
                        <button onClick={() => setCategory(null)}>×</button>
                      </span>
                    )}
                    {tag && (
                      <span className="active-filter">
                        {tag}
                        <button onClick={() => setTag(null)}>×</button>
                      </span>
                    )}
                    {brand && (
                      <span className="active-filter">
                        {brand}
                        <button onClick={() => setBrand(null)}>×</button>
                      </span>
                    )}
                  </div>
                  
                  <div className="toolbar-right">
                    <div className="sort-dropdown">
                      <select
                        value={sort || ""}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="">Sort By</option>
                        <option value="title">Name A-Z</option>
                        <option value="-title">Name Z-A</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="createdAt">Newest First</option>
                        <option value="-createdAt">Oldest First</option>
                      </select>
                    </div>
                    
                    <div className="grid-controls">
                      <button 
                        className={`grid-btn ${grid === 3 ? 'active' : ''}`}
                        onClick={() => setGrid(3)}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>
                      <button 
                        className={`grid-btn ${grid === 4 ? 'active' : ''}`}
                        onClick={() => setGrid(4)}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>
                      <button 
                        className={`grid-btn ${grid === 6 ? 'active' : ''}`}
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

                {/* Products List */}
                <div className="products-grid-wrapper">
                  <ProductCard
                    data={productState ? productState : []}
                    grid={grid}
                  />
                </div>

                {(!productState || productState.length === 0) && (
                  <div className="no-products">
                    <div className="no-products-icon">◇</div>
                    <h3>No Products Found</h3>
                    <p>Try adjusting your filters to find what you're looking for</p>
                    <button className="reset-btn" onClick={clearFilters}>
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default OurStore;
