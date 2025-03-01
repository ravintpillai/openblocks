import { CheckboxChangeEvent } from "antd/lib/checkbox";
import LoginBackground from "assets/images/loginBackground.png";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { CheckBox, TacoButton } from "openblocks-design";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ReactHotkeys from "util/hotkeys";
import { StyledLink } from "pages/common/styledComponent";
import { trans } from "i18n";

const AuthCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  height: 100%;
  background: url(${LoginBackground}) no-repeat center;
  background-size: 100% 100%;
`;

const AuthCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 480px;
  background: #ffffff;
  box-shadow: 0 0 20px 20px rgba(246, 248, 250, 0.85);
  border-radius: 16px;
  padding: 28px 36px;
  margin-top: 40px;
  @media screen and (max-width: 640px) {
    margin: 32px 18px 18px 18px;
    width: calc(100vw - 36px);
    padding: 32px 24px;
  }
`;

const AuthCardTitle = styled.div<{ type?: string }>`
  font-weight: 600;
  font-size: 28px;
  color: #222222;
  line-height: 28px;
  margin-top: 13vh;
  @media screen and (min-height: 700px) {
    margin-top: 107px;
  }
  @media screen and (max-height: 700px) {
    margin-top: 47px;
  }
  @media screen and (max-width: 640px) {
    font-size: 23px;
    line-height: 23px;
    ${(props) => props.type === "large" && "margin-top: 32px"}
  }
`;

const AuthBottom = styled.div<{ $isOverflow: boolean }>`
  display: flex;
  align-items: center;

  > button {
    margin-left: 24px;
    outline: 0;
  }

  ${(props) =>
    props.$isOverflow &&
    `
    > button > .auth-label {
       display: none; 
    }
    > button {
       margin-left: 12px;
    }
  `}
  > button:first-child {
    margin-left: 0;
  }

  @media screen and (max-width: 640px) {
    > button {
      margin-left: 22px;
    }

    img {
      width: 38px;
      height: 38px;
      margin-right: 0;
    }

    p {
      display: none;
    }
  }
`;

const StyledConfirmButton = styled(TacoButton)`
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  line-height: 16px;
  margin-top: 8px;
  transition: unset;
`;

export const AuthContainer = (props: { children: any; title?: string; type?: string }) => {
  return (
    <AuthCardContainer>
      <AuthCardTitle type={props.type}>{props.title || ""}</AuthCardTitle>
      <AuthCard>{props.children}</AuthCard>
    </AuthCardContainer>
  );
};

export function AuthBottomView(props: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    setOverflow(
      element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
    );
  }, []);

  return (
    <AuthBottom ref={ref} $isOverflow={overflow}>
      {props.children}
    </AuthBottom>
  );
}

export const ConfirmButton = (props: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  style?: CSSProperties;
  loading?: boolean;
}) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      <ReactHotkeys
        filter={() => true}
        keyName="enter"
        onKeyDown={(keyName) => {
          if (keyName === "enter" && !props.disabled && ref && ref.current) {
            ref.current.click();
          }
        }}
        global
      />
      <StyledConfirmButton ref={ref} buttonType="primary" {...props} />
    </>
  );
};

const TermsAndPrivacyContent = styled.div`
  display: flex;
  align-items: center;

  font-size: 13px;
  color: #333333;
  line-height: 13px;
  @media screen and (max-width: 640px) {
    font-size: 14px;
    line-height: 1.2;
  }
`;

const TermsAndPrivacyLabel = styled.span`
  margin-left: 8px;
`;

export const TermsAndPrivacyInfo = (props: { onCheckChange: (e: CheckboxChangeEvent) => void }) => {
  const termsUrl = trans("docUrls.terms");
  const privacyUrl = trans("docUrls.privacy");
  if (!termsUrl || !privacyUrl) {
    return null;
  }
  return (
    <TermsAndPrivacyContent>
      <CheckBox defaultChecked onChange={(e) => props.onCheckChange(e)} />
      <TermsAndPrivacyLabel>
        {trans("userAuth.registerHint")}
        <StyledLink href={termsUrl} target="_blank">
          {trans("userAuth.terms")}
        </StyledLink>
        {` `}
        <StyledLink href={privacyUrl} target="_blank">
          {trans("userAuth.privacy")}
        </StyledLink>
      </TermsAndPrivacyLabel>
    </TermsAndPrivacyContent>
  );
};

export const LoginLogoStyle = styled.img`
  margin-right: 8px;
  width: 32px;
  height: 32px;
`;

export const StyledLoginButton = styled.button`
  padding: 0;
  white-space: nowrap;
  word-break: keep-all;
  outline: 0;

  &,
  &:focus {
    display: flex;
    align-items: center;
    justify-content: center;
    border: unset;
    background: unset;
    cursor: pointer;
  }

  &:hover {
    p {
      color: #4965f2;
    }
  }
`;

export const StyledRouteLink = styled(Link)`
  display: flex;
  align-items: center;

  font-size: 16px;
  color: #4965f2;
  line-height: 16px;
  margin-left: auto;

  :hover {
    color: #315efb;
  }
`;

export const StyledRouteLinkLogin = styled(StyledRouteLink)`
  margin-bottom: 8px;
  @media screen and (max-width: 640px) {
    margin-bottom: 0;
  }
`;

export const LoginCardTitle = styled.header`
  font-weight: 500;
  font-size: 18px;
  color: #222222;
  line-height: 18px;
  margin-bottom: 36px;
  margin-top: 8px;
  @media screen and (max-width: 640px) {
    margin: 0 0 26px 0;
  }
`;

export const FormWrapperMobile = styled.div`
  @media screen and (max-width: 640px) {
    .form-input {
      margin-bottom: 26px;

      p {
        font-size: 16px;
        line-height: 16px;
      }

      input {
        height: 56px;
        border-radius: 9px;

        &.verify-input {
          height: 54px;
        }
      }

      span {
        line-height: 32px;
        font-size: 32px;
        transform: scaleX(0.5);
      }

      & > div:nth-of-type(1) {
        margin-bottom: 12px;
      }
    }

    .ant-btn-default {
      height: 56px;
      border-radius: 9px;
      margin-top: 0;
    }
  }
`;
