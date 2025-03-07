/* eslint-disable */
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { selectIsExperimental } from "@/redux/preferences";

/* [!] this is just a rough idea for now, very incomplete */

function searchFunctionsFactory() {
  return [
    searchBlockheight,
    searchBlockhash,
    searchTransactionHash,
    searchTokenCategory,
    searchAddress,
    searchMap,
    searchContacts,
    searchHelp,
  ];

  function searchBlockheight(search) {
    const result = [];

    // if search input is a number, assume it's a block height
    const canBeBlock =
      Number.isInteger(Number.parseInt(search, 10)) || search.startsWith("#"); // e.g. #478559, 478559

    return { searchContext: "height", result };
  }

  function searchBlockhash(search) {
    const result = [];
    return { searchContext: "blockhash", result };
  }

  function searchTransactionHash(search) {
    const result = [];
    return { searchContext: "txhash", result };
  }

  function searchTokenCategory(search) {
    const result = [];
    return { searchContext: "token", result };
  }

  function searchAddress(search) {
    const result = [];
    return { searchContext: "address", result };
  }

  function searchMap(search) {
    const result = [];
    return { searchContext: "map", result };
  }

  function searchContacts(search) {
    const result = [];
    return { searchContext: "contacts", result };
  }

  function searchHelp(search) {
    const result = [];
    return { searchContext: "help", result };
  }
}

export default function ExploreSearchBar() {
  const isExperimental = useSelector(selectIsExperimental);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");

  const searchFunctions = searchFunctionsFactory();

  const handleSearchTextChange = (event) => {
    const search = event.target.value;
    setSearchText(search);

    const searchResults = searchFunctions.map((searchFunc) =>
      searchFunc(search)
    );

    // search for addresses and transactions instantly if valid
    navigate(`/explore/tx/${search}`);

    // search for map locations
  };

  return isExperimental ? (
    <div className="border border-primary shadow bg-primary text-white">
      <div className="flex justify-center items-center p-2">
        <SearchOutlined className="text-2xl" />
        <input
          type="text"
          placeholder="Search"
          className="w-full ml-2 p-2 border border-primary rounded-md shadow-inner text-zinc-900"
          onChange={handleSearchTextChange}
          value={searchText}
        />
      </div>
    </div>
  ) : null;
}
