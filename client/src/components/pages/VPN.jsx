import React, { useState, useEffect } from "react";
import api from "../../api";
import { Button, Form, FormGroup, Label } from "reactstrap";
import Select from "react-select";

const VPN = () => {
  const [vpnState, setVpnState] = useState({
    cities: null,
    massagedCities: null,
     cityPrice: null,
    selectedOption: null,
    loading: true,
    message: null
  });

  useEffect(() => {
    api.getCities().then(result => {
      console.log(result,'result')
      const massagedCities = dataMassager(result.cities)
      setVpnState({
        ...vpnState,
        cities: result.cities,
        massagedCities: massagedCities,
        message: result.message,
        loading: false
      });
    });
  }, []);
// todo delete residents from api
// todo. add price in here somewhere
   const handleChange = selectedOption => {
     console.log(vpnState,'vpn')
    setVpnState({ ...vpnState, selectedOption });
  };

  const handleTravel = () => {
    console.log(vpnState,'vpn')
    const cityId = vpnState.selectedOption.value
    api.changeCity({ cityId}).then(result => {
      console.log(result, "result change city");
    });
  };

  const dataMassager = cityArray => {
    const massagedCities = [];
    cityArray.forEach(c => {
      massagedCities.push({
        value: c._id,
        label: c.name,
        price: c.price
      });
    });
    
    return massagedCities;
  };

  return (
    <div>
      <h2>VPN</h2>
      
      <Form>
        <FormGroup>
          <Label for="exampleSelect">Select</Label>
          <h6>Price: 2000</h6>
      <Select
                  value={vpnState.selectedOption}
                  onChange={handleChange}
                  options={vpnState.loading ? "" : vpnState.massagedCities}
                />
        </FormGroup>
        <Button onClick={() => handleTravel()}>Change VPN</Button>
      </Form>
    </div>
  );
};

export default VPN;
