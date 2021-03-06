import React, { Component } from "react";
import { observable, observe, when } from "mobx";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import BigNumber from "bignumber.js";
import { Wrapper, colors } from "../styles";

@inject("store")
@observer
export default class AuctionList extends Component {
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
      highestBidder
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
        <ul>
          {this.auctions.map(auction => {
            return (
              <li key={auction.id.toString()}>
                <Link to={`/auction/${auction.id.toString()}`}>
                  {auction.id.toString()}
                </Link>
              </li>
            );
          })}
        </ul>
      </Wrapper>
    );
  }
}
