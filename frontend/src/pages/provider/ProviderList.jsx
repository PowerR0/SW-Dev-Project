import { useState, useEffect } from "react";
import { getProviders } from "../../features/provider/services";
import ProviderCard from "./ProviderCard";
import { useSelector } from "react-redux";

function ViewRental() {
  const totalPage = 4;
  const { user } = useSelector((state) => state.auth);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("user", user);

  // 1. แยก input ที่ผู้ใช้กรอก กับตัวที่ใช้ fetch จริง
  const [searchInputs, setSearchInputs] = useState({
    providerName: "",
    providerAddress: "",
    minPrice: "",
    maxPrice: "",
  });

  const [filters, setFilters] = useState({
    providerName: "",
    providerAddress: "",
    isPriceAscending: true,
    minPrice: "",
    maxPrice: "",
    currentPage: 1,
    loyaltyPoint: user.loyaltyPoint,
  });

  // 2. fetch เมื่อ filters เปลี่ยนเท่านั้น
  const fetchProviders = async () => {
    const response = await fetch(`http://localhost:5000/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const latestUser = await response.json();

    console.log("latestUser", latestUser);
    const data = await getProviders({
      ...filters,
      loyaltyPoint: latestUser.data.loyaltyPoint,
    });
    setProviders(data);
    setLoading(false);
  };
  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitSearch = () => {
    setFilters((prev) => ({
      ...prev,
      ...searchInputs,
      currentPage: 1, // reset page
    }));
  };

  const handleSortChange = () => {
    setFilters((prev) => ({
      ...prev,
      isPriceAscending: !prev.isPriceAscending,
    }));
  };

  const handlePageChange = (pageNumber) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      currentPage: pageNumber,
    }));
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Rental Car Providers</h2>

          <label htmlFor='providerName'>Provider Name</label>
          <input
            type='text'
            name='providerName'
            value={searchInputs.providerName}
            onChange={handleInputChange}
            placeholder='Search by name'
          />

          <label htmlFor='providerAddress'>Provider Address</label>
          <input
            type='text'
            name='providerAddress'
            value={searchInputs.providerAddress}
            onChange={handleInputChange}
            placeholder='Search by address'
          />

          <label htmlFor='minPrice'>Min Price</label>
          <input
            type='number'
            name='minPrice'
            value={searchInputs.minPrice}
            onChange={handleInputChange}
            placeholder='Min price'
          />

          <label htmlFor='maxPrice'>Max Price</label>
          <input
            type='number'
            name='maxPrice'
            value={searchInputs.maxPrice}
            onChange={handleInputChange}
            placeholder='Max price'
          />

          <button onClick={handleSortChange}>
            Sort by Price {filters.isPriceAscending ? "▲" : "▼"}
          </button>

          <button onClick={submitSearch}>Search</button>

          {providers.length > 0 ? (
            <div className='providerList'>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  fetchProviders={fetchProviders}
                />
              ))}
            </div>
          ) : (
            <div>No providers found.</div>
          )}

          <div>
            {filters.currentPage !== 1 && (
              <button onClick={() => handlePageChange(filters.currentPage - 1)}>
                Previous
              </button>
            )}

            <div className='pageNumbers'>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={
                    filters.currentPage === pageNumber ? "active" : ""
                  }>
                  {pageNumber}
                </button>
              ))}
            </div>

            {filters.currentPage !== totalPage && (
              <button onClick={() => handlePageChange(filters.currentPage + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRental;
