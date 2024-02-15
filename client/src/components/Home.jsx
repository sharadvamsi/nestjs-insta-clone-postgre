import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Link to="/google-auth">
        <button>Sign in with Google</button>
      </Link>
      <Link to="/post-list">
        <button>Feed</button>
      </Link>
    </div>
  );
};

export default Home;
