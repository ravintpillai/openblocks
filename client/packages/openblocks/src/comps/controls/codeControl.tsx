import { EditorState } from "@codemirror/basic-setup";
import { CodeEditor } from "base/codeEditor";
import { Language } from "base/codeEditor/codeEditorTypes";
import { JSONObject, JSONValue } from "util/jsonTypes";
import {
  AbstractComp,
  changeDependName,
  changeValueAction,
  CodeNode,
  CodeNodeOptions,
  CompAction,
  CompActionTypes,
  CompParams,
  DispatchType,
  isBroadcastAction,
  Node,
  RenameAction,
  transformWrapper,
  ValueAndMsg,
  withFunction,
} from "openblocks-core";
import { EditorContext } from "comps/editorState";
import { withDefault } from "comps/generators/simpleGenerators";
import { CompExposingContext } from "comps/generators/withContext";
import { exposingDataForAutoComplete } from "comps/utils/exposingTypes";
import { ControlPropertyViewWrapper, isValidColor, toHex } from "openblocks-design";
import _ from "lodash";
import { ReactNode } from "react";
import {
  showTransform,
  toBoolean,
  toJSONArray,
  toJSONObject,
  toJSONObjectArray,
  toJSONValue,
  toNumber,
  toNumberArray,
  toObject,
  toString,
  toStringArray,
  toStringNumberArray,
  toStringOrNumber,
} from "util/convertUtils";
import { setFieldsNoTypeCheck, shallowEqual, toType } from "util/objectUtils";
import { toReadableString } from "util/stringUtils";
import { ControlLayout, ControlParams } from "./controlParams";
import { trans } from "i18n";
import { isThemeColorKey } from "api/commonSettingApi";

interface CodeControlParams<T> extends CodeNodeOptions {
  language?: Language;
  defaultCode?: string;
  expectedType?: string;
  defaultValue?: T;
  displayValueFn?: (value: T) => string;
}

export function codeControl<
  T extends JSONValue | RegExp | undefined | Function | Record<string, unknown>
>(transformFn: (value: unknown) => T, codeControlParams?: CodeControlParams<T>) {
  const { defaultValue, defaultCode, codeType, evalWithMethods } = codeControlParams || {};
  const transform = transformWrapper(transformFn, defaultValue);

  class CodeControl extends AbstractComp<T, string, Node<ValueAndMsg<T>>> {
    /**
     * Open to paramsControl,
     */
    readonly unevaledValue: string = "";
    private readonly valueAndMsg: ValueAndMsg<T> = transform(new ValueAndMsg(""));
    private readonly _node: Node<ValueAndMsg<T>>;
    private readonly _exposingNode: Node<T>;
    private readonly handleChange: (editorState: EditorState) => void;

    override getView() {
      return this.valueAndMsg.value;
    }

    constructor(params: CompParams) {
      super(params);
      this.unevaledValue = params.value?.toString() ?? defaultCode ?? "";
      this._node = withFunction(
        new CodeNode(this.unevaledValue, { codeType, evalWithMethods }),
        transform
      );
      this._exposingNode = withFunction(this._node, (x) => x.value);

      // make sure handleChange's reference only changes when the instance changes, avoid CodeEditor frequent reconfigure
      this.handleChange = _.debounce((state: EditorState) => {
        this.dispatchChangeValueAction(state.doc.toString());
      }, 50);
    }

    override changeDispatch(dispatch: DispatchType) {
      // need to re-bind handleChange when dispatch changes, otherwise old instance's dispatch is still in use
      const comp = setFieldsNoTypeCheck(this, {
        dispatch,
        handleChange: _.debounce((state: EditorState) => {
          comp.dispatchChangeValueAction(state.doc.toString());
        }, 50),
      });
      return comp;
    }

    override reduce(action: CompAction): this {
      switch (action.type) {
        case CompActionTypes.UPDATE_NODES_V2:
          if (shallowEqual(this.valueAndMsg, action.value)) {
            return this;
          }
          return setFieldsNoTypeCheck(this, { valueAndMsg: action.value });
        case CompActionTypes.CHANGE_VALUE:
          return new (this.constructor as new (params: CompParams) => this)({
            dispatch: this.dispatch,
            value: action.value,
          });
        case CompActionTypes.BROADCAST:
          if (isBroadcastAction<RenameAction>(action, CompActionTypes.RENAME)) {
            const newValue = changeDependName(
              this.unevaledValue,
              action.action.oldName,
              action.action.name,
              codeType === "Function"
            );
            if (newValue !== this.unevaledValue) {
              return this.reduce(changeValueAction(newValue));
            }
            return this;
          }
      }
      return this;
    }

    override nodeWithoutCache() {
      return this._node;
    }

    exposingNode() {
      return this._exposingNode;
    }

    override toJsonValue(): string {
      return this.unevaledValue;
    }

    propertyView(params: ControlParams): ReactNode {
      const layout: ControlLayout = (() => {
        if (params.placement === "bottom") {
          return "horizontal";
        }
        return params.layout ?? (lineFeed(this.unevaledValue) ? "vertical" : "horizontal");
      })();
      return (
        <ControlPropertyViewWrapper
          key={typeof params.label === "string" ? params.label : params.key}
          placement={params.placement}
          layout={layout}
          label={params.label}
          tooltip={params.tooltip}
          lastNode={params.lastNode}
          preInputNode={params.preInputNode}
          extraChildren={params.extraChildren}
        >
          {this.codeEditor(params)}
        </ControlPropertyViewWrapper>
      );
    }

    getValueAndMsg() {
      return this.valueAndMsg;
    }

    codeEditor(params: ControlParams) {
      const cardContent = params.disableCard
        ? ""
        : getCardContent(this.unevaledValue, this.valueAndMsg, codeControlParams);
      return (
        <EditorContext.Consumer>
          {(editorState) => (
            <CompExposingContext.Consumer>
              {(exposingData) => (
                <>
                  <CodeEditor
                    {...params}
                    bordered
                    value={this.unevaledValue}
                    codeType={codeType}
                    cardTitle={toCardTitle(codeControlParams?.expectedType, this.valueAndMsg.value)}
                    cardContent={cardContent}
                    onChange={this.handleChange}
                    hasError={this.valueAndMsg?.hasError()}
                    segments={this.valueAndMsg?.extra?.segments}
                    exposingData={{
                      ...exposingDataForAutoComplete(
                        editorState?.nameAndExposingInfo(),
                        evalWithMethods
                      ),
                      ...exposingData,
                    }}
                    enableClickCompName={editorState?.forceShowGrid}
                  />
                </>
              )}
            </CompExposingContext.Consumer>
          )}
        </EditorContext.Consumer>
      );
    }

    getPropertyView(): ReactNode {
      throw new Error("Method not implemented.");
    }
  }

  return CodeControl;
}

function toCardTitle(expectedType?: string, value?: unknown) {
  const type = expectedType ?? toType(value);
  if (Array.isArray(value)) {
    return type + "(" + value.length + ")";
  }
  if (typeof value === "object" && value !== null) {
    return type + "(" + Object.keys(value).length + " keys)";
  }
  return type;
}

function getCardContent<T>(
  unevaledValue: string,
  valueAndMsg: ValueAndMsg<T>,
  params?: CodeControlParams<T>
): string {
  const { value, midValue } = valueAndMsg;
  const content = valueAndMsg.getMsg(params?.displayValueFn);
  if (valueAndMsg.hasError()) {
    return content;
  }
  if (showTransform(midValue, params?.displayValueFn ? content : value, unevaledValue)) {
    return toReadableString(midValue).trim() + " → " + content;
  }
  return content;
}

function lineFeed(str: string) {
  const re = /\r/g;
  const rn = /\n/g;
  if (re.test(str) || rn.test(str) || str.length > 16) {
    return true;
  }
  return false;
}

function toRegExp(value: unknown): RegExp {
  const valueType = toType(value);
  if (valueType === "RegExp") {
    return value as RegExp;
  } else if (valueType === "string") {
    const regexStr = _.trimStart(_.trimEnd(value as string, "$"), "^");
    return new RegExp("^" + regexStr ?? ".*" + "$");
  }
  throw new TypeError(
    `must be a valid JavaScript regular expression without forward slashes around the pattern`
  );
}

type BoundType = "closed" | "open";

function checkRange(
  value: unknown,
  left: number = 0,
  leftBoundType: BoundType = "closed",
  right: number,
  rightBoundType: BoundType = "closed",
  defaultValue: number = 0
) {
  if (value === "") {
    return defaultValue;
  }
  const num = toNumber(value);
  if (
    ((leftBoundType === "closed" && num >= left) || num > left) &&
    (num < right || (rightBoundType === "closed" && num <= right))
  ) {
    return num;
  } else {
    throw new RangeError(
      `Value must ${leftBoundType === "closed" ? ">=" : ">"} ${left} and ${
        rightBoundType === "closed" ? "<=" : "<"
      } ${right}. Current value: ${JSON.stringify(value)}`
    );
  }
}

export type CodeControlType = ReturnType<typeof codeControl>;
// FIXME: allow only JSON as codeControl's generic type
const tmpFuncForJson = () => codeControl<JSONValue>(() => 1);
export type CodeControlJSONType = ReturnType<typeof tmpFuncForJson>;

export const StringControl = codeControl<string>(toString);
export const NumberControl = codeControl<number>(toNumber);
export const StringOrNumberControl = codeControl<string | number>(toStringOrNumber);

// rangeCheck, don't support Infinity temporarily
export class RangeControl {
  static closed(left: number, right: number, defaultValue: number = 0) {
    return codeControl<number>(
      (value) => checkRange(value, left, "closed", right, "closed", defaultValue),
      {
        expectedType: `number[${left}, ${right}]`,
      }
    );
  }

  static openClosed(left: number, right: number, defaultValue: number = 0) {
    return codeControl<number>(
      (value) => checkRange(value, left, "open", right, "closed", defaultValue),
      {
        expectedType: `number(${left}, ${right}]`,
      }
    );
  }
}

/**
 * This name is taken because BoolControl is reserved for composite structures
 */
export const BoolCodeControl = codeControl<boolean>(toBoolean);

function jsonBaseControl<T extends JSONValue | Record<string, unknown>>(
  expectedType: string | undefined,
  transformFn: (value: unknown) => T
) {
  return codeControl<T>(transformFn, { expectedType, codeType: "JSON" });
}

// General JSON control with customized transformer
export function jsonControl<T extends JSONValue | Record<string, unknown>>(
  transformer: (value: unknown) => T,
  defaultValue?: T,
  expectedType?: string
) {
  const c = jsonBaseControl<T>(expectedType, transformer);
  return defaultValue === undefined ? c : withDefault(c, JSON.stringify(defaultValue, null, 2));
}

export const ArrayStringControl = jsonBaseControl<Array<string>>("Array<string>", toStringArray);
export const ArrayStringOrNumberControl = jsonBaseControl<Array<string | number>>(
  "Array<string | number>",
  toStringNumberArray
);
export const ArrayNumberControl = jsonBaseControl<Array<number>>("Array<number>", toNumberArray);
export const JSONObjectArrayControl = jsonBaseControl<Array<JSONObject>>(
  "Array<JSON>",
  toJSONObjectArray
);
export const ArrayControl = jsonBaseControl<Array<JSONValue>>("Array", toJSONArray);
export const JSONObjectControl = jsonBaseControl<JSONObject>("JSON", toJSONObject);
export const JSONValueControl = jsonBaseControl<JSONValue>(undefined, toJSONValue);
// the main difference between Object and JSON is that Object's value can be function
export const ObjectControl = jsonBaseControl<Record<string, unknown>>("Object", toObject);

export const jsonObjectControl = (defaultValue?: JSONObject) =>
  defaultValue === undefined
    ? JSONObjectControl
    : withDefault(JSONObjectControl, JSON.stringify(defaultValue, null, 2));

export const jsonValueControl = (defaultValue?: JSONValue) =>
  defaultValue === undefined
    ? JSONValueControl
    : withDefault(JSONValueControl, JSON.stringify(defaultValue, null, 2));

export const RegexControl = codeControl<RegExp>(toRegExp);

export function stringUnionControl<T extends readonly string[]>(
  options: T,
  defaultValue: T[number]
) {
  const expectedType = options.map((option) => `"${option}"`).join(" | ");
  return codeControl<T[number]>(
    (value) => {
      let newValue = toString(value);
      if (!options.includes(newValue)) {
        newValue = defaultValue;
      }
      return newValue;
    },
    { expectedType }
  );
}

export const ColorCodeControl = codeControl<string>(
  (value: unknown) => {
    const valueString = toString(value);

    if (valueString === "") {
      return valueString;
    }
    if (isValidColor(valueString)) {
      return toHex(valueString);
    }
    if (isThemeColorKey(valueString)) {
      return valueString;
    }
    throw new Error(`the argument must be type CSS color`);
  },
  {
    expectedType: "CSS Color",
  }
);

export const RadiusControl = codeControl<string>(
  (value: unknown) => {
    const valueString = toString(value);
    if (valueString === "" || /^[0-9]+(px|%)?$/.test(valueString)) {
      return valueString;
    }
    throw new Error(
      `the argument must be a number(4), a number of pixels (4px), or a percent (50%).`
    );
  },
  {
    expectedType: "CSS",
  }
);

export const FunctionControl = codeControl<Function>(
  (value) => {
    if (typeof value === "function") {
      return value as Function;
    }
    return () => {};
  },
  { codeType: "Function", evalWithMethods: true }
);

export const TransformerCodeControl = codeControl<JSONValue>(
  (value) => {
    if (typeof value === "function") {
      try {
        return value();
      } catch (e) {
        return "";
      }
    }
    return undefined;
  },
  { codeType: "Function" }
);

export const CSSCodeControl = codeControl<string>(toString, { language: "css" });

export const CustomRuleControl = class extends StringControl {
  propertyView(params: ControlParams) {
    return super.propertyView({
      label: trans("prop.customRule"),
      tooltip: trans("prop.customRuleTooltip") + "{{Number(input1.value) < 0 ? 'error' : ''}}",
      ...params,
    });
  }
};
