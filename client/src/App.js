import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import GoogleAuth from "./components/GoogleAuth";
import PostList from "./components/PostList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/google-auth" element={<GoogleAuth />} />
        <Route path="/post-list" element={<PostList />} />
        
      </Routes>
    </Router>
  );
};

export default App;
