import React, { useState, useEffect } from "react";
import api from "../../api";
import Select from "react-select";

import {
  Button,
  Form,
  InputGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  NavLink,
  PopoverBody,
  Table,
  UncontrolledPopover,
  UncontrolledTooltip
} from "reactstrap";

/* todo */
/* rerender after add */
/* styling */

const WantedList = () => {
  const [wantedState, setWantedState] = useState({
    users: [],
    bountyUsers: [],
    loading: true,
    message: null
  });

  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelectUserChange = eventValue => {
    setSelectedOption(eventValue);
  };

  const handleInputChange = e => {
    setWantedState({
      ...wantedState,
      [e.target.name]: e.target.value
    });
  };

  useEffect(async () => {
    const apiWantedUsers = await api.getWantedUsers();
    const massagedUser = dataMassagerForSelectComponent(apiWantedUsers.users);
    setWantedState({
      ...wantedState,
      users: massagedUser,
      bountyUsers: apiWantedUsers.bountyUsers,
      message: apiWantedUsers.message,
      loading: false
    });
  }, []);

  /* todo, this is being used many times */
  const dataMassagerForSelectComponent = userArray => {
    const massagedUsers = [];
    userArray.forEach(u => {
      massagedUsers.push({
        value: u._id,
        label: u.name
      });
    });
    return massagedUsers;
  };

  const addBounty = async (bountyTargetId, bounty, clearName = "") => {
    const result = await api.addBounty({ bounty, bountyTargetId });
    const massagedUser = dataMassagerForSelectComponent(result.users);
    return setWantedState({
      ...wantedState,
      bountyTopInput: null,
      users: massagedUser,
      bountyUsers: result.bountyUsers,
      [clearName]: 0,
      message: result.message
    });
  };

  const checkDisabledAddTopButton = () => {
    if (
      selectedOption &&
      selectedOption.label &&
      wantedState.bountyTopInput &&
      wantedState.bountyTopInput >= 1000
    ) {
      return false;
    }
    return true;
  };
  const checkDisabledButton = name => {
    if (name && wantedState[name] && wantedState[name] >= 1000) {
      return false;
    }
    return true;
  };

  // select form
  const ComponentAddUnlistedPlayer = (
    <div className="pt-4 w-100 flex-column container d-flex justify-content-center align-items-center">
      <h6>Add an unlisted player</h6>
      <div className="w-50">
        <Form>
          <Select
            className="text-dark "
            value={selectedOption}
            onChange={handleSelectUserChange}
            options={wantedState.loading ? "" : wantedState.users}
          />
        </Form>
      </div>
      <div className="w-50">
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText style={{ color: "#F08F18" }}>
              &#8383;
            </InputGroupText>
          </InputGroupAddon>
          <Input
            type="number"
            min={1000}
            step="1000"
            placeholder="Amount"
            value={wantedState.bountyTopInput}
            name="bountyTopInput"
            onChange={handleInputChange}
          />
        </InputGroup>
      </div>
      <div className="m-3 mb-4 w-20" id="AddTopBountyToolTip">
        <Button
          disabled={checkDisabledAddTopButton()}
          onClick={() =>
            addBounty(selectedOption.value, wantedState.bountyTopInput)
          }
        >
          ADD
        </Button>
      </div>
      <UncontrolledTooltip placement="right" target="AddTopBountyToolTip">
        Click to add bounty
      </UncontrolledTooltip>
    </div>
  );

  // input field for bounty on targeted user
  const ComponentBountyUsersTable = (
    <Table dark>
      <thead>
        <tr>
          <th>Name</th>
          <th>Alliance</th>
          <th>Rank</th>
          <th>Donors</th>
          <th>Bounty</th>
          <th>Add bounty</th>
        </tr>
      </thead>
      <tbody>
        {wantedState.bountyUsers.map((user, i) => (
          <tr key={user._id}>
            <th scope="row">
              <NavLink href={`/hacker/${user._id}`}>{user.name}</NavLink>
            </th>
            <td>
              {user.alliance && (
                <NavLink href={`/alliance/${user.alliance._id}`}>
                  {user.alliance.name}
                </NavLink>
              )}
            </td>
            <td>{user.playerStats.rankName}</td>
            <td>
              <Button id={`PopoverFocus${i}`} type="button">
                {user.playerStats.bountyDonors.length}
              </Button>
              <UncontrolledPopover
                placement="right"
                target={`PopoverFocus${i}`}
              >
                <PopoverBody>
                  {user.playerStats.bountyDonors.map((d, j) => (
                    <NavLink key={j} href={`/hacker/${d._id}`}>
                      {d.name}
                    </NavLink>
                  ))}
                </PopoverBody>
              </UncontrolledPopover>
            </td>

            <td>{user.playerStats.bounty}</td>
            <td>
              <InputGroup>
                <Input
                  step={1000}
                  min={1000}
                  type="number"
                  name={user.name}
                  value={wantedState[user.name]}
                  onChange={handleInputChange}
                />
                <InputGroupAddon addonType="append">
                  <Button
                    onClick={() =>
                      addBounty(user._id, wantedState[user.name], user.name)
                    }
                    disabled={checkDisabledButton(user.name)}
                    name={user.name}
                  >
                    ADD BOUNTY
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="container mt-5">
      <h2>Wanted</h2>
      <h3>Cyber Criminals</h3>
      {wantedState.loading ? (
        <p>loading..</p>
      ) : (
        <>
          <div> {ComponentAddUnlistedPlayer} </div>
          <div> {ComponentBountyUsersTable} </div>
        </>
      )}
    </div>
  );
};
export default WantedList;
