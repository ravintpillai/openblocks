import { Form, Input, InputProps, Radio, Select } from "antd";
import { ReactNode } from "react";
import { CheckBox } from "./checkBox";
import { CustomSelect } from "./customSelect";
import { labelCss } from "./Label";
import { ToolTipLabel } from "./toolTip";
import styled from "styled-components";
import { ReactComponent as Star } from "icons/icon-star.svg";
import { FormItemProps } from "antd/lib/form/FormItem";
import _ from "lodash";
import { KeyValueList } from "./keyValueList";
import { DropdownIcon, OptionsType, ValueFromOption } from "./Dropdown";
import { RadioGroupProps } from "antd/lib/radio/interface";
import { EllipsisTextCss } from "./Label";

export type FormSize = "middle" | "small";

const FormItem = styled(Form.Item)`
  min-width: 0;
  flex-grow: 1;
  margin: 0;
  line-height: 13px;

  .ant-form-item-explain {
    font-size: 12px;
  }

  .ant-form-item-control-input {
    min-height: auto;
  }

  .ant-input {
    width: 100%;
  }
`;
const FormInput = styled(Input)`
  background: #ffffff;
  border: 1px solid #d7d9e0;
  border-radius: 4px;
`;

const FormInputPassword = styled(Input)`
  background: #ffffff;
  border: 1px solid #d7d9e0;
  border-radius: 4px;
`;

const FormCheckbox = styled(CheckBox)`
  width: 448px;
  height: 16px;

  font-size: 13px;
  color: #8b8fa3;
  line-height: 13px;
`;

const StartIcon = styled(Star)`
  margin-right: 4px;
`;
const LabelDiv = styled.div<{ width?: number }>`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
  margin-right: 8px;
  width: ${(props) => props.width || 122}px;
  flex-shrink: 0;
`;
const FormItemContain = styled.div`
  width: 100%;
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: nowrap;

  div > .ant-input:hover {
    border: 1px solid #8b8fa3;
  }

  div > .ant-input:focus,
  div > .ant-input-focused {
    border: 1px solid #3377ff;
    box-shadow: 0 0 0 2px #d6e4ff;
  }

  div > .ant-input[disabled] {
    background-color: #f5f5f6;
  }

  div > .ant-input[disabled]:hover {
    border-color: #d7d9e0;
  }
`;
export const FormSectionLabel = styled.label`
  ${labelCss};

  font-size: 13px;
  color: #8b8fa3;
  line-height: 13px;
  user-select: text;
  margin-right: auto;
  overflow: hidden;
  max-width: 100px;
`;
export const FormSection = styled.div<{ size?: FormSize }>`
  width: 100%;

  .taco-form-item-wrapper {
    padding-left: ${(props) => (props.size === "middle" ? "24px" : "0")};
  }
`;

interface FormProps extends FormItemProps {
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  help?: ReactNode;
  labelWidth?: number;
}

const FormItemLabel = (props: Partial<FormProps>) => (
  <LabelDiv width={props.labelWidth}>
    <StartIcon style={{ visibility: props.required ? "visible" : "hidden" }} />
    <ToolTipLabel title={props.help} label={props.label} labelStyle={{ fontSize: "14px" }} />
  </LabelDiv>
);

export const FormInputItem = (props: FormProps & InputProps) => (
  <FormItemContain className={"taco-form-item-wrapper"}>
    {props.label && <FormItemLabel {...props} />}
    <FormItem
      name={props.name}
      rules={props.rules}
      initialValue={props.initialValue}
      validateFirst={true}
      hasFeedback={true}
    >
      <FormInput
        autoFocus={props.autoFocus}
        autoComplete={"off"}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
    </FormItem>
  </FormItemContain>
);

export const FormInputPasswordItem = (props: FormProps) => (
  <FormItemContain className={"taco-form-item-wrapper"}>
    <FormItemLabel {...props} />
    <FormItem
      rules={props.rules}
      name={props.name}
      initialValue={props.initialValue}
      validateFirst={true}
      hasFeedback={true}
    >
      <FormInputPassword
        type={"password"}
        autoComplete={"one-time-code"}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
    </FormItem>
  </FormItemContain>
);

const CustomCheckbox = (props: any) => {
  const { value, onChange } = props;
  return (
    <FormCheckbox
      disabled={props.disabled}
      defaultChecked={props.initialValue}
      checked={value}
      onChange={(v) => onChange(v?.target?.checked)}
    >
      <ToolTipLabel title={props.tooltip} label={props.label} />
    </FormCheckbox>
  );
};

export const FormCheckboxItem = (props: FormProps) => {
  return (
    <FormItemContain className={"taco-form-item-wrapper"}>
      <LabelDiv width={props.labelWidth} />
      <FormItem
        rules={props.rules}
        name={props.name}
        initialValue={props.initialValue}
        validateFirst={true}
      >
        <CustomCheckbox {...props} />
      </FormItem>
    </FormItemContain>
  );
};

export const FormRadioItem = (props: FormProps & RadioGroupProps) => {
  return (
    <FormItemContain className={"taco-form-item-wrapper"}>
      <FormItemLabel {...props} />
      <FormItem
        rules={props.rules}
        name={props.name}
        initialValue={props.initialValue}
        validateFirst={true}
      >
        <Radio.Group options={props.options}></Radio.Group>
      </FormItem>
    </FormItemContain>
  );
};

const SelectWrapper = styled.div`
  height: 32px;
  caret-color: transparent;
  flex-grow: 0;

  .ant-select .ant-select-selector {
    padding: 0 0 0 8px;
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    font-size: 13px;
    line-height: 13px;
  }

  .ant-select-selection-item {
    height: 30px;
  }
`;

const SelectLabel = styled.div`
  ${EllipsisTextCss}
`;

const FormSelect = (props: any) => {
  const { value, onChange } = props;

  return (
    <SelectWrapper>
      <CustomSelect
        value={value}
        style={{
          width: "100%",
          minWidth: "120px",
          maxWidth: "100%",
        }}
        maxTagCount={"responsive" as const}
        onChange={(x) => {
          onChange(x);
          props.afterChange && props.afterChange(x);
        }}
        suffixIcon={<DropdownIcon />}
        dropdownMatchSelectWidth={false}
        placeholder={props.placeholder}
        dropdownRender={props.dropdownRender}
      >
        {props.options.map((item: any) => {
          return (
            <Select.Option key={item.value} value={item.value}>
              <SelectLabel>{item.label}</SelectLabel>
            </Select.Option>
          );
        })}
      </CustomSelect>
    </SelectWrapper>
  );
};

export function FormSelectItem<T extends OptionsType>(
  props: {
    options: T;
    afterChange?: (value: ValueFromOption<T>) => void;
  } & FormProps
) {
  return (
    <FormItemContain className={"taco-form-item-wrapper"}>
      {props.label && <FormItemLabel {...props} />}
      <FormItem
        rules={props.rules}
        name={props.name}
        initialValue={props.initialValue}
        validateFirst={true}
      >
        <FormSelect {...props} />
      </FormItem>
    </FormItemContain>
  );
}

const KeyInput = styled(FormInput)`
  width: 160px;
  margin-right: 8px;
`;
const ValueInput = styled(FormInput)`
  width: 256px;
`;
const FormKeyValueList = (props: any) => {
  const { value, onChange } = props;

  let items = value;
  if (_.isEmpty(items)) {
    items = [{ key: "", value: "" }];
  }
  return (
    <KeyValueList
      list={items.map((item: { key: string; value: string }, index: number) => (
        <>
          <KeyInput
            value={item.key}
            placeholder={"key"}
            onChange={(event) => {
              items[index].key = event.target.value;
              onChange([...items]);
            }}
          />
          <ValueInput
            value={item.value}
            placeholder={"value"}
            onChange={(event) => {
              items[index].value = event.target.value;
              onChange([...items]);
            }}
          />
        </>
      ))}
      onAdd={() => onChange([...items, { key: "", value: "" }])}
      onDelete={(item, index) => {
        if (items.length <= 1) {
          return;
        }
        items.splice(index, 1);
        onChange([...items]);
      }}
    />
  );
};
export const FormKeyValueItem = (props: FormProps) => (
  <FormItemContain className={"taco-form-item-wrapper"}>
    <FormItemLabel {...props} />
    <FormItem
      rules={props.rules}
      name={props.name}
      initialValue={props.initialValue}
      validateFirst={true}
    >
      <FormKeyValueList />
    </FormItem>
  </FormItemContain>
);

export const DatasourceForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
