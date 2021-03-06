import React, { Component } from "react";
import { observable, observe, when } from "mobx";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import BigNumber from "bignumber.js";
import {
  Wrapper,
  Spacer,
  Divider,
  colors,
  LeftContainer,
  RightContainer,
  Button
} from "../styles";
import {
  Container,
  Status,
  StatusPulse,
  Gallery,
  Heading,
  Description,
  SellerInformation
} from "./auction/auction";
import CountDown from "./CountDown";
import test from "../images/test.png";
import { getEndDate } from "../utils";

@inject("store")
@observer
export default class Home extends Component {
  @observable auctions = [];
  @observable auctionsLength = new BigNumber(0);

  async componentDidMount() {
    this.auctionBaseWatcher = when(
      () => this.props.store.readOnlyAuctionBaseInstance,
      () => {
        this.getAuctionsLength();
        this.blockWatcher = observe(
          this.props.store,
          "currentBlock",
          () => {
            this.getAuctionsLength();
          },
          true // invoke immediately
        );
      }
    );

    this.auctionsLengthWatcher = observe(this, "auctionsLength", () => {
      this.getAuctions();
    });
  }

  componentWillUnmount() {
    if (this.auctionBaseWatcher) {
      this.auctionBaseWatcher();
    }

    if (this.auctionsLengthWatcher) {
      this.auctionsLengthWatcher();
    }

    if (this.blockWatcher) {
      this.blockWatcher();
    }
  }

  async getAuctionsLength() {
    const { readOnlyAuctionBaseInstance } = this.props.store;
    this.auctionsLength = await readOnlyAuctionBaseInstance.getAuctionsCount(
      {},
      this.props.store.currentBlock
    );
  }

  async getAuctions() {
    if (this.auctionsLength === 0) return false;
    const promises = [];
    for (let i = 0; i < this.auctionsLength; i++) {
      promises.push(this.importAuction(i));
    }
    this.auctions = await Promise.all(promises);
  }

  async importAuction(_id) {
    const { currentBlock, readOnlyAuctionBaseInstance } = this.props.store;
    const [
      id,
      nftAddress,
      tokenId,
      seller,
      bidIncrement,
      duration,
      startedAt,
      startBlock,
      status,
      highestBid,
      highestBidder
    ] = await readOnlyAuctionBaseInstance.getAuction(_id, currentBlock);
    const endDate = getEndDate(startedAt.toString(), duration.toNumber() * 14);
    return {
      id,
      nftAddress,
      tokenId,
      seller,
      bidIncrement,
      duration,
      startedAt,
      startBlock,
      status,
      highestBid,
      highestBidder,
      endDate
    };
  }

  statusText(status) {
    if (status.equals(0)) return "Live";
    else if (status.equals(1)) return "Cancelled";
    else return "Completed";
  }

  statusColor(status) {
    if (status.equals(0)) return colors.green;
    else if (status.equals(1)) return colors.yellow;
    else return colors.blue;
  }

  render() {
    const auctionOfInterest = this.auctions[0];
    if (!auctionOfInterest) return null;

    return (
      <Wrapper>
        <Spacer size={3} />
        <Container style={{ color: "white" }}>
          <LeftContainer width={40}>
            <Status>
              {this.statusText(auctionOfInterest.status)}{" "}
              <StatusPulse
                active={this.statusText(auctionOfInterest.status) === "Live"}
                color={this.statusColor(auctionOfInterest.status)}
              />
            </Status>
            <Spacer size={0.5} />

            <Heading>Auction #{auctionOfInterest.id.toString()}</Heading>
            <SellerInformation>by {auctionOfInterest.seller}</SellerInformation>
            <Spacer size={0.5} />

            <Description>
              NFT: {auctionOfInterest.tokenId.toString()}@{
                auctionOfInterest.nftAddress
              }
            </Description>
            <Divider padded={1.5} />
            <CountDown endDate={auctionOfInterest.endDate} />
            <Spacer />
            <Link to={`/auction/${auctionOfInterest.id.toString()}`}>
              <Button>View</Button>
            </Link>
          </LeftContainer>
          <RightContainer width={55}>
            <Gallery>
              <img src={test} />
            </Gallery>
          </RightContainer>
        </Container>
      </Wrapper>
    );
  }
}
