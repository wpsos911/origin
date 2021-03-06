import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import ConnectivityDropdown from 'components/dropdowns/connectivity'
import MessagesDropdown from 'components/dropdowns/messages'
import NotificationsDropdown from 'components/dropdowns/notifications'
import TransactionsDropdown from 'components/dropdowns/transactions'
import UserDropdown from 'components/dropdowns/user'

class NavBar extends Component {
  render() {
    const { showNav, mobileDevice } = this.props

    return showNav && (
      <nav className="navbar navigation-bar navbar-expand-lg navbar-dark">
        <div className="container">
          <button
            className="navbar-toggler mr-3"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <img src="images/origin-icon-white.svg" alt="Origin menu" />
          </button>
          <Link
            to="/"
            className="navbar-brand mr-auto mr-lg-3"
            ga-category="top_nav"
            ga-label="logo"
          >
            <div className="d-none d-lg-block logo-container">
              <img
                src="images/origin-logo.svg"
                className="origin-logo"
                alt="Origin Protocol"
              />
            </div>
          </Link>
          <div
            className="collapse navbar-collapse order-2 order-lg-1"
            id="navbarSupportedContent"
          >
            <div className="navbar-nav justify-content-end">
              <Link
                to="/"
                className="d-lg-none nav-item nav-link"
                ga-category="top_nav"
                ga-label="listings"
              >
                <FormattedMessage
                  id={'navbar.listings'}
                  defaultMessage={'Listings'}
                />
              </Link>
              <Link
                to="/my-purchases"
                className="nav-item nav-link"
                ga-category="top_nav"
                ga-label="buying"
              >
                <FormattedMessage
                  id={'navbar.buying'}
                  defaultMessage={'Buying'}
                />
              </Link>
              <div className="sell dropdown">
                <a
                  className="dropdown-toggle nav-item nav-link"
                  id="sellDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  ga-category="top_nav"
                  ga-label="sell_dropdown"
                >
                  <FormattedMessage
                    id={'navbar.selling'}
                    defaultMessage={'Selling'}
                  />
                </a>
                <div
                  className="dropdown-menu dropdown-menu-right"
                  aria-labelledby="sellDropdown"
                >
                  <div className="triangle-container d-none d-lg-flex justify-content-end">
                    <div className="triangle" />
                  </div>
                  <div className="actual-menu">
                    <Link
                      to="/my-listings"
                      className="dropdown-item"
                      ga-category="top_nav"
                      ga-label="sell_dropdown_my_listings"
                    >
                      <FormattedMessage
                        id={'navbar.myListings'}
                        defaultMessage={'My Listings'}
                      />
                    </Link>
                    <Link
                      to="/my-sales"
                      className="dropdown-item"
                      ga-category="top_nav"
                      ga-label="sell_dropdown_my_sales"
                    >
                      <FormattedMessage
                        id={'navbar.mySales'}
                        defaultMessage={'My Sales'}
                      />
                    </Link>
                    <Link
                      to="/create"
                      className="dropdown-item d-none d-lg-block"
                      ga-category="top_nav"
                      ga-label="sell_dropdown_add_listing"
                    >
                      <FormattedMessage
                        id={'navbar.addListing'}
                        defaultMessage={'Add a Listing'}
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                to="/create"
                className="nav-item nav-link"
                ga-category="top_nav"
                ga-label="add_listing"
              >
                <img
                  src="images/add-listing-icon.svg"
                  alt="Add Listing"
                  className="add-listing"
                />
                <FormattedMessage
                  id={'navbar.addListing'}
                  defaultMessage={'Add a Listing'}
                />
              </Link>
            </div>
          </div>
          <div className="static navbar-nav order-1 order-lg-2 d-flex flex-row justify-content-end">
            { !mobileDevice && <ConnectivityDropdown /> }
            <TransactionsDropdown />
            <MessagesDropdown />
            <NotificationsDropdown />
            <UserDropdown />
          </div>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = ({ app }) => {
  return {
    mobileDevice: app.mobileDevice,
    showNav: app.showNav
  }
}

export default connect(
  mapStateToProps
)(NavBar)
