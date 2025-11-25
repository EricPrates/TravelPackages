import { use, useEffect, useState } from "react";

export default function HomeController(){

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const response = async () => {

            console.log("Fetching data for query:", searchQuery);
        }
    }, [searchQuery]);
    return {
        state: { searchQuery },
        actions: { setSearchQuery },
      };

}
