import moment from 'moment'
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { enableMessaging } from 'actions/Activation'
import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

import { formattedAddress } from 'utils/user'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || (2 * 1024 * 1024) // 2 MiB

class Message extends Component {
  componentDidMount() {
    const { message } = this.props

    if (message.status === 'unread') {
      this.props.updateMessage({ ...message, status: 'read' })
    }
  }

  render() {
    const {
      enableMessaging,
      message,
      messagingEnabled,
      user,
      contentOnly,
      mobileDevice
    } = this.props
    const { created, hash } = message
    const { address, fullName, profile } = user

    if (contentOnly) {
      return <div className="d-flex compact-message">{this.renderContent()}</div>
    }

    if (mobileDevice) {
      return (
        <div className="message-section">
          <div className="timestamp text-center ml-auto">
            {moment(created).format('MMM Do h:mm a')}
          </div>
          <div className="d-flex message">
            <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
            <div className="content-container">
              <div className="meta-container d-flex">
                <div className="sender text-truncate">
                  <span className="name">{fullName || address}</span>
                </div>
              </div>
              <div className="message-content">{this.renderContent()}</div>
              {!messagingEnabled &&
                hash === 'origin-welcome-message' && (
                <div className="button-container">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={enableMessaging}
                    ga-category="messaging"
                    ga-label="message_component_enable"
                  >
                    <FormattedMessage
                      id={'message.enable'}
                      defaultMessage={'Enable Messaging'}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="d-flex message">
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container">
          <div className="meta-container d-flex">
            <div className="sender text-truncate">
              {fullName && <span className="name">{fullName}</span>}
              <span className="address text-muted">{formattedAddress(address)}</span>
            </div>
            <div className="timestamp text-right ml-auto">
              {moment(created).format('MMM Do h:mm a')}
            </div>
          </div>
          <div className="message-content">{this.renderContent()}</div>
          {!messagingEnabled &&
            hash === 'origin-welcome-message' && (
            <div className="button-container">
              <button
                className="btn btn-sm btn-primary"
                onClick={enableMessaging}
                ga-category="messaging"
                ga-label="message_component_enable"
              >
                <FormattedMessage
                  id={'message.enable'}
                  defaultMessage={'Enable Messaging'}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderContent() {
    const { content } = this.props.message
    const contentWithLineBreak = `${content}\n`
    const contentIsData = content.match(/^data:/)
    const dataIsImage = contentIsData && content.match(/^data:image/)
    const imageTooLarge = content.length > imageMaxSize

    if (!contentIsData) {
      return contentWithLineBreak
    } else if (!dataIsImage) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.unrecognizedData'}
            defaultMessage={'Message data cannot be rendered.'}
          />
        </div>
      )
    } else if (imageTooLarge) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.imageTooLarge'}
            defaultMessage={'Message image is too large to display.'}
          />
        </div>
      )
    } else {
      const fileName = content.match(/name=.+;/).slice(5, -1)
      return (
        <div className="image-container">
          <img src={content} alt={fileName} />
        </div>
      )
    }
  }
}

const mapStateToProps = ({ activation, app, users }, ownProps) => {
  return {
    messagingEnabled: activation.messaging.enabled,
    mobileDevice: app.mobileDevice,
    user: users.find(u => {
      return formattedAddress(u.address) === formattedAddress(ownProps.message.senderAddress)
    }) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  enableMessaging: () => dispatch(enableMessaging()),
  updateMessage: obj => dispatch(updateMessage(obj))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Message)
