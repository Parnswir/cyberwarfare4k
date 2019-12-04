import React, { useState, useEffect } from "react";
import api from "../../api";

const PettyHack = () => {
  const [pettyState, setPettyState] = useState({
    loading: true,
    message: null,
    hacking: false
  });

  useEffect(() => {
    console.log("using effect");
  }, []);

  const toggleHack = () => {
    setPettyState({
      ...pettyState,
      hacking: !pettyState.hacking
    });
    setTimeout(() => {
      startHack();
    }, 100);
  };

  const startHack = () => {
    console.log("start hack", pettyState.hacking);
    if (pettyState.hacking) {
      let pettyHackInterval = setInterval(() => {
        if (!pettyState.hacking) {
          console.log("clearing");
          clearInterval(pettyHackInterval);
        }
        api
          .pettyHack()
          .then(result => {
            console.log(result);
          })
          .catch(err => console.log(err));
      }, 4000);
    }
  };

  return (
    <div className="PettyHack">
      <h2>Petty hackr</h2>
      <button onClick={toggleHack}>Start hacking</button>
      {pettyState.message && <div className="info">{pettyState.message}</div>}
    </div>
  );
};

export default PettyHack;
