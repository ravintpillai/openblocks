import {
  hookToStateComp,
  simpleValueComp,
  simpleValueGetterComp,
} from "comps/generators/hookToComp";
import _ from "lodash";
import moment from "moment";
import { useInterval, useTitle, useWindowSize } from "react-use";
import React, { useContext, useEffect, useMemo } from "react";
import {
  simpleMultiComp,
  withDefault,
  withPropertyViewFn,
  withTypeAndChildren,
  withViewFn,
} from "comps/generators";
import { StringControl } from "comps/controls/codeControl";
import { withSimpleExposing } from "comps/generators/withExposing";
import { ModalComp } from "comps/hooks/modalComp";
import { SimpleNameComp } from "comps/comps/simpleNameComp";
import { Section, sectionNames } from "openblocks-design";
import { CompName } from "components/CompName";
import { EditorContext } from "comps/editorState";
import { changeChildAction } from "openblocks-core";
import { ConstructorToComp } from "openblocks-core";
import { HookCompConstructor, HookCompMapRawType, HookCompType } from "comps/hooks/hookCompTypes";
import { getAllCompItems } from "comps/comps/containerBase/utils";
import UrlParamsHookComp from "./UrlParamsHookComp";
import { UtilsComp } from "./utilsComp";
import { MessageComp } from "./messageComp";
import { LocalStorageComp } from "./localStorageComp";
import { DrawerComp } from "comps/hooks/drawerComp";
import { useSelector } from "react-redux";
import { getCurrentUser } from "redux/selectors/usersSelectors";
import { getOrgGroups } from "redux/selectors/orgSelectors";
import { trans } from "i18n";
import { UserConnectionSource } from "constants/userConstants";
import { fullAvatarUrl } from "util/urlUtils";

window._ = _;
window.moment = moment;

const LodashJsLib = simpleValueComp(_);
const MomentJsLib = simpleValueComp(moment);

const WindowSizeComp = hookToStateComp(useWindowSize);

const CurrentUserHookComp = hookToStateComp(() => {
  const user = useSelector(getCurrentUser);
  const groups = useSelector(getOrgGroups);
  return useMemo(() => {
    const emailConnection = user.connections?.find((c) => c.source === UserConnectionSource.email);
    return {
      id: user.id,
      name: user.username,
      avatarUrl: fullAvatarUrl(user.avatarUrl),
      email: emailConnection ? emailConnection.name : "",
      groups: groups
        .filter((g) => !g.allUsersGroup)
        .map((g) => {
          return {
            groupId: g.groupId,
            groupName: g.groupName,
          };
        }),
    };
  }, [user, groups]);
});

function useCurrentTime() {
  const [time, setTime] = React.useState(0);
  useInterval(() => {
    setTime(new Date().getTime());
  }, 1000);
  return useMemo(
    () => ({
      time: time,
    }),
    [time]
  );
}

const CurrentTimeHookComp = hookToStateComp(useCurrentTime);
const TitleTmp1Comp = withViewFn(
  simpleMultiComp({
    title: withDefault(StringControl, "Title Test"),
  }),
  (comp) => {
    useTitle(comp.children.title.getView());
    return null;
  }
);
const TitleTmp2Comp = withSimpleExposing(TitleTmp1Comp, (comp) => ({
  title: comp.children.title.getView(),
}));

const TitleHookComp = withPropertyViewFn(TitleTmp2Comp, (comp) => {
  return (
    <Section name={sectionNames.basic}>
      {comp.children.title.propertyView({
        label: trans("title"),
      })}
    </Section>
  );
});

const HookMap: HookCompMapRawType = {
  title: TitleHookComp,
  windowSize: WindowSizeComp,
  currentTime: CurrentTimeHookComp,
  lodashJsLib: LodashJsLib,
  momentJsLib: MomentJsLib,
  utils: UtilsComp,
  message: MessageComp,
  localStorage: LocalStorageComp,
  modal: ModalComp,
  currentUser: CurrentUserHookComp,
  urlParams: UrlParamsHookComp,
  drawer: DrawerComp,
};

export const HookTmpComp = withTypeAndChildren(HookMap, "title", {
  name: SimpleNameComp,
});

function SelectHookView(props: {
  children: React.ReactNode;
  compName: string;
  compType: HookCompType;
  comp: ConstructorToComp<HookCompConstructor>;
}) {
  const editorState = useContext(EditorContext);
  const selectedComp = editorState.selectedComp();
  // Select the modal and its subcomponents on the left to display the modal
  useEffect(() => {
    if (
      (props.compType !== "modal" && props.compType !== "drawer") ||
      !selectedComp ||
      (editorState.selectSource !== "addComp" && editorState.selectSource !== "leftPanel")
    ) {
      return;
    } else if ((selectedComp as any).children.comp === props.comp) {
      // Select the current modal to display the modal
      !props.comp.children.visible.getView().value &&
        props.comp.children.visible.dispatch(changeChildAction("value", true));
    } else {
      // all child components of modal
      const allChildComp = getAllCompItems((props.comp as any).getCompTree());
      const selectChildComp = Object.values(allChildComp).find((child) => child === selectedComp);
      const visible = props.comp.children.visible.getView().value;
      if (selectChildComp && !visible) {
        props.comp.children.visible.dispatch(changeChildAction("value", true));
      } else if (!selectChildComp && visible) {
        props.comp.children.visible.dispatch(changeChildAction("value", false));
      }
    }
  }, [selectedComp, editorState.selectSource]);

  return (
    <div onClick={() => editorState.setSelectedCompNames(new Set([props.compName]))}>
      {props.children}
    </div>
  );
}

export class HookComp extends HookTmpComp {
  exposingInfo() {
    return this.children.comp.exposingInfo();
  }

  override getView() {
    const view = this.children.comp.getView();
    if (!view) {
      // most hook components have no view
      return view;
    }
    return (
      <SelectHookView
        compName={this.children.name.getView()}
        compType={this.children.compType.getView()}
        comp={this.children.comp}
      >
        {view}
      </SelectHookView>
    );
  }

  override getPropertyView() {
    return (
      <>
        <CompName name={this.children.name.getView()} />
        {this.children.comp.getPropertyView()}
      </>
    );
  }
}
