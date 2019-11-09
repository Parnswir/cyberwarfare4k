import React, { useState, useEffect } from "react";
import api from "../../api";

import { Table, Button, UncontrolledTooltip } from "reactstrap";

const DataCenter = () => {
  const [dataCenterState, setDataCenterState] = useState({
    dataCenters: [],
    message: null,
    loading: true
  });

  useEffect(async () => {
    api.getDataCenters().then(result => {
      setDataCenterState({
        ...dataCenterState,
        dataCenters: result.dataCenters,
        loading: false
      });
    });
  }, []);

  const handleDataCenterPurchase = e => {
    const dataCenterName = e.target.name;
    console.log(dataCenterName, "centername");
    api.purchaseDataCenter({ dataCenterName }).then(result => {
      console.log(result, "result purchase");
    });
  };

  const checkHealth = (current, max) => {
    const percentage = (current / max) * 100;
    let result;
    switch (percentage) {
      case percentage > 99:
        result = "Full";
        break;
      case percentage > 90:
        result = "High";
        break;
      case percentage > 74:
        result = "Medium/high";
        break;
      case percentage > 49:
        result = "Medium";
        break;
      case percentage > 24:
        result = "Medium/low";
        break;
      case percentage > 0:
        result = "low";
        break;
      default:
        result = "broken";
    }
    return result;
  };

  const dataCenterTable = (
    <Table dark>
      <thead>
        <tr>
          <th>Name</th>
          {/* Price only available when not owned */}
          <th>Price</th> {/* Also, prettify number */}
          <th>Status</th> {/* tooltip on owned? */}
          <th>Required Stash</th>
          <th>Action</th>
          {/* <th>Difficulty</th> */}
          <th>Health</th>
          <th>Attacker</th>
          <th>Alliance</th>
        </tr>
      </thead>
      <tbody>
        {dataCenterState.dataCenters.map((dc, i) => (
          <tr key={dc._id}>
            <th scope="row">{dc.name}</th>
            <td id={`revenueTip${i}`}>{dc.price}</td>
            <td>{dc.status}</td>
            <tr>
              {/* shouldn't be visible if it's not purchased yet */}
              <td>{dc.requiredStash[0].name}</td>
              <td>{dc.requiredStash[1].name}</td>
              <td>{dc.requiredStash[2].name}</td>
            </tr>

            <td>
              <Button
                name={dc.name}
                onClick={e => this.handleDataCenterPurchase(e)}
              >
                {dc.status === "Owned" ? "ATTACK" : "BUY"}
              </Button>
            </td>
            <td>{checkHealth(dc.currentFirewall, dc.maxFirewall)}</td>
            <UncontrolledTooltip placement="top" target={`revenueTip${i}`}>
              <span style={{ color: "#F08F18" }}>&#8383;</span>
              {dc.minutlyrevenue} per minute
            </UncontrolledTooltip>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div>
      <h2>Data centers</h2>
      {dataCenterState.loading ? <p>loading..</p> : dataCenterTable}
    </div>
  );
};

export default DataCenter;
