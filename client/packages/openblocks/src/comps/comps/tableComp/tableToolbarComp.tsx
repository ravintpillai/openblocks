import { Pagination, Popover } from "antd";
import { PaginationProps } from "antd/lib/pagination/Pagination";
import { changeChildAction } from "openblocks-core";
import { ConstructorToView } from "openblocks-core";
import { BoolControl } from "comps/controls/boolControl";
import { StringControl } from "comps/controls/codeControl";
import { MultiCompBuilder, stateComp } from "comps/generators";
import { genRandomKey } from "comps/utils/idGenerator";
import {
  CheckBox,
  CommonTextLabel,
  CustomSelect,
  SuspensionBox,
  TacoButton,
  TacoInput,
} from "openblocks-design";
import { LinkButton } from "openblocks-design";
import { ValueFromOption } from "openblocks-design";
import {
  BluePlusIcon,
  DeleteIcon,
  DownloadIcon,
  FilterIcon,
  RefreshIcon,
  SettingIcon,
} from "openblocks-design";
import { pageItemRender } from "openblocks-design";
import _, { isNil } from "lodash";
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import styled, { css } from "styled-components";
import { JSONValue } from "util/jsonTypes";
import { ColumnCompType } from "comps/comps/tableComp/column/tableColumnComp";
import { defaultTheme, TableStyleType } from "comps/controls/styleControlConstants";
import { ThemeContext } from "comps/utils/themeContext";
import { ThemeDetail } from "api/commonSettingApi";
import { trans } from "i18n";

const StyledPagination = styled(Pagination)`
  margin-left: auto;
`;

const getStyle = (style: TableStyleType, filtered: boolean, theme: ThemeDetail) => {
  return css`
    background-color: ${style.toolbarBackground};

    .toolbar-icons {
      .refresh,
      .download {
        cursor: pointer;

        * {
          ${style.toolbarText !== defaultTheme.textDark ? `stroke: ${style.toolbarText}` : null};
        }

        &:hover * {
          stroke: ${theme.primary};
        }
      }

      .filter {
        cursor: pointer;

        * {
          ${filtered
            ? `stroke: ${defaultTheme.primary}`
            : style.toolbarText !== defaultTheme.textDark
            ? `stroke: ${style.toolbarText}`
            : null}
        }

        &:hover * {
          stroke: ${theme.primary};
        }
      }

      .column-setting {
        cursor: pointer;

        * {
          ${style.toolbarText !== defaultTheme.textDark ? `stroke: ${style.toolbarText}` : null}
        }

        &:hover * {
          stroke: ${theme.primary};
        }
      }
    }

    .ant-pagination-prev,
    .ant-pagination-next {
      path {
        ${style.toolbarText !== defaultTheme.textDark ? `fill: ${style.toolbarText}` : null};
      }

      svg:hover {
        path {
          fill: ${theme.primary};
        }
      }
    }

    .ant-pagination {
      color: ${style.toolbarText};
    }

    .ant-pagination-item-active {
      border-color: ${theme?.primary};

      a {
        color: ${theme?.textDark};
      }
    }

    .ant-pagination-item:not(.ant-pagination-item-active) a {
      color: ${style.toolbarText};

      &:hover {
        color: ${theme.primary};
      }
    }

    .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
    .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input)
      .ant-select-selector,
    .ant-pagination-options-quick-jumper input:hover,
    .ant-pagination-options-quick-jumper input:focus {
      border-color: ${theme.primary};
    }
  `;
};

const FooterBarWrapper = styled.div<{
  $style: TableStyleType;
  $filtered: boolean;
  theme: ThemeDetail;
}>`
  // Implement horizontal scrollbar and vertical page number selection is not blocked
  margin-top: -300px;
  padding: 313px 16px 13px 16px;
  overflow: auto;
  ${(props) => props.$style && getStyle(props.$style, props.$filtered, props.theme)}
`;

const FooterBarWrapper2 = styled.div`
  display: flex;
  align-items: center;
  min-width: max-content;
  height: 21px;
  width: 100%;
`;

const ToolbarIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledDeleteIcon = styled(DeleteIcon)<{ disabled: boolean }>`
  height: 16px;
  width: 16px;

  ${(props) =>
    props.disabled &&
    `
      cursor: not-allowed;
      g g {
      stroke: #D7D9E0;
    }
  `}
  :hover:not([disabled]) {
    cursor: pointer;

    g g {
      stroke: #315efb;
    }
  }
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterViewContent = styled.div`
  min-height: 92px;
  overflow: auto;

  > div {
    margin-top: 4px;
  }
`;

const FilterViewBottom = styled.div`
  display: flex;
  align-items: end;
  height: 44px;
  justify-content: end;
  gap: 4px;

  > button {
    width: 76px;
    height: 28px;
  }
`;

const ColumnCheckItem = styled.div`
  display: flex;
  gap: 4px;
`;

const filterStackOptions = [
  {
    label: trans("table.and"),
    value: "and",
  },
  {
    label: trans("table.or"),
    value: "or",
  },
] as const;

const tableFilterOperators = [
  "contain",
  "notContain",
  "equal",
  "notEqual",
  "isEmpty",
  "isNotEmpty",
  "gt",
  "gte",
  "lt",
  "lte",
] as const;
const noValueOperators: TableFilterOperator[] = ["isEmpty", "isNotEmpty"];

type TableFilterOperator = typeof tableFilterOperators[number];
export const tableFilterOperatorMap: Record<
  TableFilterOperator,
  {
    label: string;
    filter: (filterValue: string, data: JSONValue | undefined) => boolean;
  }
> = {
  contain: {
    label: trans("table.contains"),
    filter: (filterValue, data) => {
      if (isNil(data)) {
        return false;
      }
      return data.toString().includes(filterValue);
    },
  },
  notContain: {
    label: trans("table.notContain"),
    filter: (filterValue, data) => {
      if (isNil(data)) {
        return true;
      }
      return !data.toString().includes(filterValue);
    },
  },
  equal: {
    label: trans("table.equals"),
    filter: (filterValue, data) => {
      if (isNil(data)) {
        return false;
      }
      return data.toString() === filterValue;
    },
  },
  notEqual: {
    label: trans("table.isNotEqual"),
    filter: (filterValue, data) => {
      if (isNil(data)) {
        return true;
      }
      return data.toString() !== filterValue;
    },
  },
  isEmpty: {
    label: trans("table.isEmpty"),
    filter: (filterValue, data) => {
      return data === "" || isNil(data);
    },
  },
  isNotEmpty: {
    label: trans("table.isNotEmpty"),
    filter: (filterValue, data) => {
      return data !== "" && !isNil(data);
    },
  },
  gt: {
    label: trans("table.greater"),
    filter: (value, data) => {
      return _.gt(data, value);
    },
  },
  gte: {
    label: trans("table.greaterThanOrEquals"),
    filter: (value, data) => {
      return _.gte(data, value);
    },
  },
  lt: {
    label: trans("table.lessThan"),
    filter: (value, data) => {
      return _.gt(value, data);
    },
  },
  lte: {
    label: trans("table.lessThanOrEquals"),
    filter: (value, data) => {
      return _.gte(value, data);
    },
  },
} as const;

type TableFilterDataType = {
  columnKey: string;
  filterValue: string;
  operator: TableFilterOperator;
};

export type TableFilter = {
  stackType: ValueFromOption<typeof filterStackOptions>;
  filters: TableFilterDataType[];
};

const genFilterViewItem = (
  columnKey: string = "",
  filterValue: string = "",
  operator?: TableFilterOperator
) => {
  return {
    key: genRandomKey(),
    columnKey: columnKey,
    filterValue: filterValue,
    operator: operator,
  } as const;
};

type FilterItemType = ReturnType<typeof genFilterViewItem>;

function validFilterItem(filter: FilterItemType) {
  return (
    filter.columnKey &&
    filter.operator &&
    (filter.filterValue !== "" || noValueOperators.includes(filter.operator))
  );
}

function emptyFilterItem(filter: FilterItemType) {
  return !filter.columnKey && !filter.operator && filter.filterValue === "";
}

function TableFilterView(props: {
  columnKeyNames: Array<[string, string]>;
  tableFilter: TableFilter;
  onFilterChange: (filters: TableFilterDataType[], stackType: TableFilter["stackType"]) => void;
  setVisible: (v: boolean) => void;
}) {
  const { columnKeyNames, tableFilter, onFilterChange, setVisible } = props;
  const [stackTypeState, setStackTypeState] = useState(tableFilter.stackType);
  const [filters, setFilters] = useState<FilterItemType[]>([genFilterViewItem()]);
  const updateFilter = (filterItem: FilterItemType) => {
    setFilters(
      filters.map((f) =>
        f.key === filterItem.key
          ? {
              ...filterItem,
            }
          : f
      )
    );
  };
  useEffect(() => {
    onFilterChange(
      filters
        .filter((f) => validFilterItem(f))
        .map((f) => ({
          filterValue: f.filterValue,
          operator: f.operator!,
          columnKey: f.columnKey,
        })),
      stackTypeState
    );
  }, [stackTypeState, filters]);

  const popOverContent = (
    <FilterViewContent>
      {filters &&
        filters.map((filter, index) => {
          return (
            <FilterItem key={filter.key}>
              {index === 0 && (
                <CommonTextLabel style={{ width: "65px" }}>
                  {trans("table.filterRule")}
                </CommonTextLabel>
              )}
              {index >= 1 && (
                <CustomSelect
                  style={{ width: "65px" }}
                  border
                  defaultValue={stackTypeState}
                  value={filterStackOptions.find((f) => f.value === stackTypeState)?.value}
                  disabled={index > 1}
                  onChange={(value) => setStackTypeState(value)}
                >
                  {filterStackOptions.map((item, index) => {
                    return (
                      <CustomSelect.Option key={item.value} value={item.value}>
                        <div style={{ width: "72px", fontSize: "13px", lineHeight: "13px" }}>
                          {item.label}
                        </div>
                      </CustomSelect.Option>
                    );
                  })}
                </CustomSelect>
              )}
              <CustomSelect
                options={columnKeyNames.map((c) => ({ label: c[1], value: c[0] }))}
                style={{ width: "160px" }}
                placeholder={trans("table.chooseColumnName")}
                allowClear
                onChange={(value) => {
                  updateFilter({ ...filter, columnKey: value });
                }}
              />
              <CustomSelect
                defaultValue={filter.operator}
                placeholder={trans("table.chooseCondition")}
                style={{ width: "160px" }}
                allowClear
                options={tableFilterOperators.map((operator) => ({
                  label: tableFilterOperatorMap[operator].label,
                  value: operator,
                }))}
                onChange={(value) => {
                  updateFilter({ ...filter, operator: value });
                }}
              />
              <TacoInput
                style={{ width: "136px" }}
                disabled={filter.operator && noValueOperators.includes(filter.operator)}
                defaultValue={filter.filterValue}
                onChange={(e) => {
                  updateFilter({ ...filter, filterValue: e.target.value });
                }}
              />
              <StyledDeleteIcon
                disabled={filters.length === 1 && emptyFilterItem(filters[0])}
                onClick={() => {
                  if (filters.length === 1) {
                    setFilters([genFilterViewItem()]);
                  } else {
                    setFilters(filters.filter((f) => f.key !== filter.key));
                  }
                }}
              />
            </FilterItem>
          );
        })}
    </FilterViewContent>
  );

  const filterFooter = (
    <FilterViewBottom>
      <LinkButton
        style={{ marginRight: "auto" }}
        text={trans("addItem")}
        icon={<BluePlusIcon />}
        onClick={() => {
          setFilters(filters.concat(genFilterViewItem()));
        }}
      />
      <TacoButton
        onClick={() => {
          setFilters([genFilterViewItem()]);
        }}
        buttonType="delete"
      >
        {trans("table.clear")}
      </TacoButton>
      <TacoButton buttonType="primary" onClick={() => setVisible(false)}>
        {trans("ok")}
      </TacoButton>
    </FilterViewBottom>
  );
  return (
    <SuspensionBox
      title={trans("table.filter")}
      onClose={() => setVisible(false)}
      width={600}
      scrollable
      contentMaxHeight={292}
      content={popOverContent}
      footer={filterFooter}
    />
  );
}

export const TableToolbarComp = (function () {
  const childrenMap = {
    showRefresh: BoolControl,
    showDownload: BoolControl,
    showFilter: BoolControl,
    columnSetting: BoolControl,
    searchText: StringControl,
    filter: stateComp<TableFilter>({ stackType: "and", filters: [] }),
  };

  return new MultiCompBuilder(childrenMap, (props, dispatch) => {
    return {
      ...props,
      onFilterChange: (filters: TableFilterDataType[], stackType: TableFilter["stackType"]) => {
        dispatch(
          changeChildAction("filter", {
            stackType: stackType,
            filters: filters,
          })
        );
      },
    };
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          {children.showFilter.propertyView({ label: trans("table.showFilter") })}
          {children.showRefresh.propertyView({ label: trans("table.showRefresh") })}
          {children.showDownload.propertyView({ label: trans("table.showDownload") })}
          {children.columnSetting.propertyView({ label: trans("table.columnSetting") })}
          {children.searchText.propertyView({
            label: trans("table.searchText"),
            tooltip: trans("table.searchTextTooltip"),
            placeholder: "{{input1.value}}",
          })}
        </>
      );
    })
    .build();
})();

function ColumnSetting(props: {
  columns: Array<ColumnCompType>;
  setVisible: (v: boolean) => void;
}) {
  const { columns, setVisible } = props;
  let allChecked = true;
  const checkViews = columns.map((c) => {
    const columnView = c.getView();
    const checked = !columnView.tempHide;
    if (!checked) {
      allChecked = false;
    }
    return (
      <ColumnCheckItem>
        <CheckBox
          checked={checked}
          onChange={(e) => {
            c.children.tempHide.dispatchChangeValueAction(!e.target.checked);
          }}
        />
        <CommonTextLabel>{columnView.title || columnView.dataIndex}</CommonTextLabel>
      </ColumnCheckItem>
    );
  });
  return (
    <SuspensionBox
      title={trans("table.columnShows")}
      onClose={() => setVisible(false)}
      width={160}
      contentMaxHeight={150}
      scrollable
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{checkViews}</div>
      }
      footer={
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "32px",
          }}
        >
          <ColumnCheckItem>
            <CheckBox
              checked={allChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                columns.forEach((c) => {
                  const tempHide = c.children.tempHide.getView();
                  // fixme batch dispatch
                  if (checked && tempHide) {
                    c.children.tempHide.dispatchChangeValueAction(false);
                  } else if (!checked && !tempHide) {
                    c.children.tempHide.dispatchChangeValueAction(true);
                  }
                });
              }}
            />
            <CommonTextLabel>{trans("table.selectAll")}</CommonTextLabel>
          </ColumnCheckItem>
        </div>
      }
    />
  );
}

function ToolbarPopover(props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  iconClassName: string;
  content: JSX.Element;
}) {
  const { visible, setVisible, Icon, iconClassName, content } = props;
  const iconRef = useRef<SVGSVGElement>(null);
  const popOverRef = useRef<HTMLDivElement>(null);
  return (
    <Popover
      visible={visible}
      overlayStyle={{ pointerEvents: "auto" }}
      content={
        <div
          ref={popOverRef}
          tabIndex={-1}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget) && iconRef.current !== e.relatedTarget) {
              setVisible(false);
            }
          }}
        >
          {content}
        </div>
      }
    >
      <Icon
        className={iconClassName}
        tabIndex={-1}
        ref={iconRef}
        onBlur={(e) => {
          if (!popOverRef.current?.contains(e.relatedTarget)) {
            setVisible(false);
          }
        }}
        onClick={() => setVisible(!visible)}
      />
    </Popover>
  );
}

type ToolbarRowType = ConstructorToView<typeof TableToolbarComp>;

export function TableFooterBar(props: {
  toolbar: ToolbarRowType;
  $style: TableStyleType;
  pagination: PaginationProps;
  columns: Array<ColumnCompType>;
  onRefresh: () => void;
  onDownload: () => void;
}) {
  const { toolbar, pagination, columns, onRefresh, onDownload } = props;
  const [filterVisible, setFilterVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const visibleColumns = columns.filter((c) => !c.children.hide.getView());
  const columnKeyNameTuple = useMemo(() => {
    return visibleColumns.map((column) => {
      const c = column.getView();
      return [c.dataIndex, c.title || c.dataIndex] as [string, string];
    });
  }, [columns]);
  const theme = useContext(ThemeContext)?.theme;

  return (
    <FooterBarWrapper
      $style={props.$style}
      theme={theme}
      $filtered={toolbar.filter.filters.length > 0}
    >
      <FooterBarWrapper2>
        <ToolbarIcons className="toolbar-icons">
          {toolbar.showRefresh && <RefreshIcon className="refresh" onClick={onRefresh} />}
          {toolbar.showFilter && (
            <ToolbarPopover
              visible={filterVisible}
              setVisible={setFilterVisible}
              content={
                <TableFilterView
                  columnKeyNames={columnKeyNameTuple}
                  tableFilter={toolbar.filter}
                  onFilterChange={toolbar.onFilterChange}
                  setVisible={(v) => setFilterVisible(v)}
                />
              }
              Icon={FilterIcon}
              iconClassName="filter"
            />
          )}
          {toolbar.showDownload && <DownloadIcon className="download" onClick={onDownload} />}
          {toolbar.columnSetting && (
            <ToolbarPopover
              visible={settingVisible}
              setVisible={setSettingVisible}
              content={<ColumnSetting columns={visibleColumns} setVisible={setSettingVisible} />}
              Icon={SettingIcon}
              iconClassName="column-setting"
            />
          )}
        </ToolbarIcons>
        <StyledPagination size="small" itemRender={pageItemRender} {...pagination} />
      </FooterBarWrapper2>
    </FooterBarWrapper>
  );
}
