import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import styled from "react-emotion";
import {
  Wrapper,
  headerHeight,
  basePadding,
  colors,
  FloatRight
} from "../styles";
import logo from "../images/logo.png";

const HeaderContainer = styled("div")`
  box-sizing: border-box;
  height: ${headerHeight}px;
  width: 100%;
  line-height: ${headerHeight - 2 * basePadding}px;
  background-color: black;
  padding-top: ${basePadding}px;
`;

const HeaderText = styled("span")`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 300;
  display: inline-block;
  padding: ${basePadding}px 0;
  margin: 0 0 0 ${basePadding}px;
  & a {
    color: white;
  }
  & a:hover {
    text-decoration: none;
    color: ${colors.grey};
  }
`;

const Logo = styled("div")`
  cursor: pointer;
  box-sizing: border-box;
  height: ${headerHeight - 1}px;
  display: inline-block;
  & img {
    height: ${headerHeight - basePadding * 1.4 - 1}px;
  }
  padding: ${basePadding * 0.7}px 0;
`;

@inject("store")
@observer
export default class Header extends Component {
  render() {
    return (
      <HeaderContainer>
        <Wrapper>
          <Logo>
            <Link to="/">
              <img src={logo} />
            </Link>
          </Logo>

          <FloatRight>
            <HeaderText>
              <Link to="/auctions">Auctions</Link>
            </HeaderText>

            <HeaderText>
              <Link to="/about">About</Link>
            </HeaderText>
          </FloatRight>
        </Wrapper>
      </HeaderContainer>
    );
  }
}
