import { Button, Divider, Table } from "antd";
import { ThemeDetail } from "api/commonSettingApi";
import { ScrollBar } from "openblocks-design";
import { backgroundToBorder, defaultTheme } from "comps/controls/styleControlConstants";
import { CustomModal, TacoButton, TacoInput } from "openblocks-design";
import { darkenColor, isDarkColor } from "openblocks-design";
import styled, { css } from "styled-components";
import { MoreActionIcon } from "openblocks-design";

export const ThemeContent = styled.div`
  padding: 32px 20px;
  max-width: 2200px;
  min-width: 880px;
  width: 100%;
`;

export const DetailContainer = styled(ThemeContent)`
  padding: 32px 36px;
`;

export const Title = styled.div`
  font-size: 18px;
  margin: 0 12px 21px 12px;
  font-family: PingFangSC-Medium;
  color: #222;
  line-height: 1;
  display: flex;
  justify-content: space-between;
  align-items: start;
  > span {
    display: inline-flex;
    align-items: center;
    margin-top: -1px;
  }
`;

export const CreateButton = styled(Button)`
  background-color: #4965f2;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #4965f2;
  &.ant-btn-primary:hover,
  &.ant-btn-primary:focus {
    background: #315efb;
    border-color: #315efb;
  }
  &:disabled,
  &:disabled:hover {
    background: #dbe1fd;
    color: #ffffff;
    border-color: #dbe1fd;
  }
  svg {
    margin-right: 2px;
    width: 12px;
    height: 12px;
  }
`;

export const SaveButton = styled(CreateButton)`
  padding: 4px 15px;
`;

export const DetailHead = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 17px;
`;

export const FlexAlignCenter = styled.div`
  display: flex;
  align-items: center;
`;

export const InlineFlexAlignCenter = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const ColumnName = styled(InlineFlexAlignCenter)`
  overflow: hidden;
  margin-right: 168px;
`;

export const NameDiv = styled(FlexAlignCenter)`
  display: flex;

  .ant-typography {
    display: flex;
    padding: 8px 0;
    height: 32px;
    width: fit-content;
    font-weight: 500;
    font-size: 18px;
    color: #222222;
    line-height: 18px;
  }

  .ant-typography-edit-content {
    padding: unset;
    margin: unset;
    left: unset;
  }

  .ant-typography-edit {
    height: 16px;
    width: 16px;
  }

  .ant-input,
  .ant-input:focus,
  .ant-input-focused {
    height: 32px !important;
    background: #ffffff;
    border: 1px solid #3377ff;
    border-radius: 4px;
    font-weight: 500;
    font-size: 16px;
    color: #222222;
    line-height: 16px;
    padding: 7px 12px;
    white-space: nowrap;
    width: 435px;

    ::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const DetailContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  grid-column-gap: 24px;
  > div:nth-of-type(1) {
    margin-top: -3px;
    min-width: 280px;
  }
`;

export const DetailTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 17px;
`;

export const BackBtn = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
  height: 24px;

  :hover {
    color: #4965f2;
  }

  svg {
    transform: rotate(-90deg);
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }

  :hover svg g path {
    fill: #4965f2;
  }
`;

export const ResetButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  font-size: 13px;
  padding: 4px 14px;
  color: #333333;
  svg {
    margin-right: 2px;
  }
  &.ant-btn-default:hover,
  &.ant-btn-default:focus {
    background: #f5f5f6;
    color: #333333;
    border-color: #d7d9e0;
  }
  &:disabled,
  &:disabled:hover {
    background: #ffffff;
    color: rgba(51, 51, 51, 0.3);
    border-color: #efeff1;
    svg g g {
      opacity: 0.3;
    }
  }
`;

export const DividerStyled = styled(Divider)`
  margin: 21px 0;
  border-color: #ebebeb;
`;

export const ModalNameDiv = styled(FlexAlignCenter)`
  display: flex;
  align-items: center;
  padding: 3.5px 0;
  svg {
    margin-right: 4px;
  }
`;

export const TacoInputStyled = styled(TacoInput)`
  margin-bottom: 5px;
  height: 32px;
  > input {
    height: 100%;
  }
  .ant-input-suffix {
    color: #999;
  }
  &.exceed .input-length {
    color: #f73131;
  }
`;

export const ThemeBtn = styled.div<{ theme: ThemeDetail }>`
  width: 180px;
  margin-bottom: 4px;
  height: auto;
  padding: 7px;
  background-color: ${(props) => props.theme.canvas};
  border-radius: 6px;
  border: 1px solid #efeff1;
  font-size: 12px;
  position: relative;
  cursor: pointer;
  color: ${(props) =>
    isDarkColor(props.theme.primarySurface) ? props.theme.textLight : props.theme.textDark};
  .name {
    font-size: 13px;
    font-weight: 600;
    max-width: 120px;
    overflow: hidden;
    white-space: nowrap;
  }
  &:hover,
  &:focus,
  &:active {
    background-color: ${(props) => props.theme.canvas};
    border-color: #315efb;
    box-shadow: 0 0 1px 4px #d6e4ff;
  }
  > div {
    border-radius: 6px;
    overflow: hidden;
    display: block;
    border: 1px solid ${(props) => darkenColor(props.theme.primarySurface, 0.1)};
    background-color: ${(props) => props.theme.primarySurface};
    span {
      display: inline-flex;
      align-items: center;
    }
    > div {
      display: flex;
      align-items: center;
      padding: 0 6px;
      border-bottom: 1px solid ${(props) => darkenColor(props.theme.primarySurface, 0.1)};
    }
    > div:nth-of-type(1) {
      height: 28px;
      justify-content: space-between;
      overflow: hidden;
      svg {
        margin-right: 2px;
        rect {
          fill: ${(props) => props.theme.primary};
        }
      }
    }
    > div:nth-of-type(2) {
      height: 44px;
      justify-content: space-between;
      > div {
        display: grid;
        margin-right: 7px;
        height: 100%;
      }
      .radio {
        line-height: 1;
        &:nth-of-type(1) {
          margin: 5px 0 4px 0;
        }
        &:nth-of-type(2) {
          margin: 4px 0 5px 0;
        }
        span,
        svg {
          margin-right: 2px;
          circle:nth-of-type(1) {
            stroke: ${(props) => props.theme.primary};
          }
          circle:nth-of-type(2) {
            fill: ${(props) => props.theme.primary};
          }
        }
        span {
          width: 12px;
          height: 12px;
          display: inline-block;
          border: 1px solid #d7d9e0;
          border-radius: 50%;
        }
      }
      > span {
        justify-content: end;
      }
      .input-span {
        margin-left: 3px;
        width: 50px;
        height: 20px;
        border-radius: 3px;
        border: 1px solid #d7d9e0;
        background: #ffffff;
      }
    }
    > div:nth-of-type(3) {
      height: 30px;
      border-bottom: none;
      justify-content: end;
      .button-span {
        border-radius: 3px;
        height: 20px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${(props) => props.theme.primary};
        color: ${(props) =>
          isDarkColor(props.theme.primary) ? props.theme.textLight : props.theme.textDark};
      }
    }
  }
  > svg {
    circle {
      fill: #4965f2;
    }
    width: 20px;
    height: 20px;
    position: absolute;
    right: 9px;
    top: 9px;
    display: none;
  }
  &.selected {
    border-color: #315efb;
    box-shadow: 0 0 1px 4px #d6e4ff;
    > svg {
      display: inline-block;
    }
  }
`;

export const SelectContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 4px 12px;
`;

export const ScrollBarStyled = styled(ScrollBar)`
  > div {
    margin: 0 -4px;
    padding: 0 4px;
  }
  .simplebar-track {
    right: -16px;
  }
`;

export const SelectTitle = styled.div`
  font-size: 13px;
  color: #8b8fa3;
  line-height: 13px;
  margin: 11px 0 8px 0;
`;

export const SelectTitleTheme = styled(SelectTitle)`
  margin-top: 12px;
`;

export const ConfigItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 9px 0 10px 0;
  &.text-light {
    margin-top: -34.5px;
    margin-bottom: 24px;
  }
  .text-desc {
    font-size: 13px;
    line-height: 1.5;
    .desc {
      color: #8b8fa3;
      margin-top: 2px;
    }
  }
  .config-input {
    &:hover {
      border-color: #3377ff;
    }
    &:focus {
      box-shadow: 0 0 0 3px #3377ff19;
    }
    display: flex;
    align-items: start;
    margin-top: 3px;
    overflow: hidden;
    justify-content: end;
    > div:nth-of-type(1) {
      border: none;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      width: 28px;
      height: 28px;
      min-width: 28px;
    }
    .ant-input {
      outline: none;
      height: 28px;
      width: 156px;
      border: none;
      border: 1px solid #d7d9e0;
      margin-left: 8px;
      &:hover,
      &:focus,
      &:active {
        outline: none;
        border-color: #d7d9e0;
        box-shadow: none;
      }
    }
  }
`;

export const Radius = styled.div<{ radius: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px 0 0 4px;
  border: 1px solid #d7d9e0;
  > div {
    margin: 7px;
    overflow: hidden;
    height: 13px;
    width: 13px;
    > div {
      height: 24px;
      width: 24px;
      border: 2px solid #777;
      border-radius: ${(props) => props.radius};
    }
  }
`;

export const ControlCol = styled(FlexAlignCenter)`
  justify-content: end;
  height: 100%;
`;

export const TableStyled = styled(Table)`
  .ant-table {
    tbody {
      &::before {
        content: " ";
        display: block;
        height: 4px;
      }
    }
    tr {
      display: grid;
      grid-template-columns: 1.34fr 1.34fr 0.32fr;
      padding: 0 12px;
    }
    .ant-table-row {
      cursor: pointer;
      &:nth-last-of-type(1) td {
        border: none;
      }
      &.row-hover {
        background-color: #f5f7fa;
        border-radius: 8px;
        td {
          background: none;
          .edit-button {
            opacity: 1;
          }
        }
      }
      td {
        display: flex;
        align-items: center;
        border-color: #ebebeb;
        padding: 9.5px 0;
        border-radius: 0;
        &:nth-last-of-type(1) {
          justify-content: end;
        }
      }
    }
    thead tr th {
      background-color: #ffffff;
      color: #8b8fa3;
      font-weight: 400;
      border-color: #e1e3eb;
      padding: 8px 0;
      line-height: 1;
      &::before {
        display: none;
      }
    }
    .default {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 16px;
      padding: 0 5px;
      min-width: 36px;
      border-radius: 8px;
      border: 1px solid #d6e4ff;
      background: #ffffff;
      font-size: 12px;
      color: #4965f2;
      margin-left: 4px;
    }
  }
  .ant-table-empty {
    tbody tr {
      grid-template-columns: 1fr;
      td:nth-last-of-type(1) {
        justify-content: center;
      }
      &:nth-last-of-type(1) td {
        border: none;
      }
    }
  }
  .ant-dropdown {
    min-width: 110px !important;
    .ant-dropdown-menu {
      padding: 8px;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
      border-radius: 8px;
      .ant-dropdown-menu-item {
        padding: 8px;
        span {
          font-size: 13px;
          color: #333333;
          line-height: 13px;
        }
        &:nth-last-of-type(1) span {
          color: #f73131;
        }
        &:hover {
          background: #f2f7fc;
          border-radius: 4px;
        }
      }
    }
  }
`;

export const EditButton = styled(TacoButton)`
  width: 52px;
  height: 24px;
  padding: 5px 12px;
  margin-left: 8px;
  opacity: 0;
`;

export const StyledMoreActionIcon = styled(MoreActionIcon)`
  width: 16px;
  height: 16px;

  :hover {
    background: #eef0f3;
    border-radius: 4px;
    cursor: pointer;

    path {
      fill: #3377ff;
    }
  }
`;

export const ListDropdown = styled(FlexAlignCenter)`
  height: 100%;
`;

export const MoreIconDiv = styled(FlexAlignCenter)`
  padding-left: 52px;
  height: 100%;
`;

const getTagStyle = (theme: ThemeDetail) => {
  return css`
    background-color: ${theme.canvas};
    padding: 6px 8px;
    .left,
    .right {
      width: 21px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .left {
      background-color: ${theme.primary};
      border-radius: 4px 0 0 4px;
    }
    .right {
      background-color: ${theme.primarySurface};
      border-radius: 0 4px 4px 0;
    }
  `;
};

export const TagDesc = styled.span<{ theme: ThemeDetail }>`
  display: inline-flex;
  margin-right: 12px;
  height: 36px;
  width: 58px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  ${(props) => getTagStyle(props.theme)}
`;

export const EmptySpan = styled.span`
  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      padding: 0 3px;
      color: #4965f2;
      &:hover {
        color: #315efb;
      }
    }
  }
`;

export const EllipsisSpan = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: keep-all;
`;

export const CustomModalStyled = styled(CustomModal)`
  button {
    margin-top: 20px;
  }
`;
