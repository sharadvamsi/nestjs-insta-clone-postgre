import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GoogleAuth = () => {
  return (
    <div>
      <GoogleOAuthProvider clientId= "give_your_client_id">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const response = await axios.post("http://localhost:3001/login", {
              token: credentialResponse.credential,
              
            });
            console.log(response.data.token)
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleAuth;
