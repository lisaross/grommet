import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { deepMerge } from '../utils';
import { getBodyChildElements, makeNodeFocusable, makeNodeUnfocusable } from './utils';

export const withFocus = (WrappedComponent) => {
  class FocusableComponent extends Component {
    state = {
      mouseActive: false,
      focus: false,
    }
    setMouseActive() {
      this.setState({ mouseActive: true });
    }
    resetMouseActive() {
      this.setState({ mouseActive: false });
    }
    setFocus() {
      const { mouseActive } = this.state;
      if (mouseActive === false) {
        this.setState({ focus: true });
      }
    }
    resetFocus() {
      this.setState({ focus: false });
    }
    render() {
      const { focus } = this.state;
      return (
        <WrappedComponent
          focus={focus}
          {...this.props}
          onMouseDown={(event) => {
            this.setMouseActive();
            const { onMouseDown } = this.props;
            if (onMouseDown) {
              onMouseDown(event);
            }
          }}
          onMouseUp={(event) => {
            this.resetMouseActive();
            const { onMouseUp } = this.props;
            if (onMouseUp) {
              onMouseUp(event);
            }
          }}
          onFocus={(event) => {
            this.setFocus();
            const { onFocus } = this.props;
            if (onFocus) {
              onFocus(event);
            }
          }}
          onBlur={(event) => {
            this.resetFocus();
            const { onBlur } = this.props;
            if (onBlur) {
              onBlur(event);
            }
          }}
        />
      );
    }
  }

  return FocusableComponent;
};

export const withTheme = (WrappedComponent) => {
  class ThemedComponent extends Component {
    static contextTypes = {
      theme: PropTypes.object,
    }
    render() {
      const { theme, ...rest } = this.props;
      const { theme: contextTheme } = this.context;
      const localTheme = deepMerge(contextTheme, theme);
      return (
        <WrappedComponent theme={localTheme} {...rest} />
      );
    }
  }

  return ThemedComponent;
};

const isNotAncestorOf = child => parent => !parent.contains(child);

export const withRestrictScroll = (WrappedComponent) => {
  class RestrictScrollContainer extends Component {
    render() {
      return (
        <WrappedComponent {...this.props} restrictScroll={true} />
      );
    }
  }
  return RestrictScrollContainer;
};

export const restrictFocusTo = (WrappedComponent) => {
  class FocusedContainer extends Component {
    componentDidMount() {
      const { restrictScroll } = this.props;
      const child = findDOMNode(this.ref);
      getBodyChildElements()
        .filter(isNotAncestorOf(child))
        .forEach(makeNodeUnfocusable);

      if (restrictScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    componentWillUnmount() {
      const { restrictScroll } = this.props;
      const child = findDOMNode(this.ref);
      getBodyChildElements()
        .filter(isNotAncestorOf(child))
        .forEach(makeNodeFocusable);
      if (restrictScroll) {
        document.body.style.overflow = 'scroll';
      }
    }

    render() {
      return (
        <WrappedComponent ref={(ref) => { this.ref = ref; }} {...this.props} />
      );
    }
  }

  return FocusedContainer;
};

export default { withFocus, withRestrictScroll, withTheme, restrictFocusTo };