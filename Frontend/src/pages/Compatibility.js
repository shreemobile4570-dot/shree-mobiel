import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import BreadCrumb from "../components/BreadCrumb";
import Container from "../components/Container";
import Meta from "../components/Meta";
import { base_url } from "../utils/axiosConfig";

const categoryOptions = [
  { value: "", label: "All Parts" },
  { value: "display", label: "Display" },
  { value: "battery", label: "Battery" },
  { value: "charging board", label: "Charging Board" },
  { value: "camera", label: "Camera" },
  { value: "back panel", label: "Back Panel" },
];

const Compatibility = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchCompatibility = useCallback(async (event, forcedQuery) => {
    if (event) event.preventDefault();
    const searchText = String(forcedQuery ?? query).trim();

    if (!searchText) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get(`${base_url}compatibility/search`, {
        params: { query: searchText, category: category || undefined },
      });
      setResults(response.data || []);
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, query]);

  useEffect(() => {
    if (!hasSearched) return;
    const timer = setTimeout(() => searchCompatibility(), 350);
    return () => clearTimeout(timer);
  }, [category, hasSearched, searchCompatibility]);

  return (
    <>
      <Meta title="Compatibility | Shree Mobile" />
      <BreadCrumb title="Compatibility" />
      <Container class1="compatibility-wrapper py-5">
        <div className="compatibility-shell">
          <div className="compatibility-heading">
            <span>Shared Parts Lookup</span>
            <h1>Compatibility</h1>
            <p>
              Search a mobile model to find which display, battery, or other part models
              can be used across matching phones.
            </p>
          </div>

          <form className="compatibility-search-panel" onSubmit={searchCompatibility}>
            <div className="compatibility-field compatibility-category-field">
              <label htmlFor="compatibility-category">Part Type</label>
              <select
                id="compatibility-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="compatibility-field">
              <label htmlFor="compatibility-query">Model Search</label>
              <div className="compatibility-search-input">
                <FiSearch />
                <input
                  id="compatibility-query"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search model, e.g. Redmi Note 10"
                />
              </div>
            </div>

            <button className="compatibility-search-button" type="submit" disabled={isLoading}>
              {isLoading ? "Searching" : "Search"}
            </button>
          </form>

          <div className="compatibility-results">
            {results.map((item) => (
              <article className="compatibility-card" key={item._id}>
                <div className="compatibility-card-top">
                  <span>{item.category}</span>
                  <h2>{item.mainModel}</h2>
                  <p>Main part/model used for the following compatible models.</p>
                </div>

                <div className="compatibility-model-grid">
                  <div className="compatibility-main-model">
                    <small>Main Model</small>
                    <strong>{item.mainModel}</strong>
                  </div>
                  {(item.compatibleModels || []).map((model) => (
                    <button
                      type="button"
                      className="compatibility-model-chip"
                      key={model}
                      onClick={() => {
                        setQuery(model);
                        setHasSearched(true);
                        searchCompatibility(null, model);
                      }}
                    >
                      {model}
                    </button>
                  ))}
                </div>

                {item.notes && <p className="compatibility-note">{item.notes}</p>}
              </article>
            ))}

            {hasSearched && !isLoading && results.length === 0 && (
              <div className="compatibility-empty">
                <h2>No compatibility found</h2>
                <p>Try another model name or select All Parts before searching again.</p>
              </div>
            )}

            {!hasSearched && (
              <div className="compatibility-empty">
                <h2>Search any model</h2>
                <p>
                  If the model is entered as a compatible model, the same full group will
                  still be shown with its main part model.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default Compatibility;
