import { FunctionControl } from "comps/controls/codeControl";
import { MultiCompBuilder, withDefault } from "comps/generators";
import { QueryResult } from "./queryComp";
import { QueryTutorials } from "util/tutorialUtils";
import { DocLink } from "openblocks-design";
import { getGlobalSettings } from "comps/utils/globalSettings";
import { trans } from "i18n";
import { QUERY_EXECUTION_ERROR, QUERY_EXECUTION_OK } from "../../constants/queryConstants";

export const JSQuery = (function () {
  const childrenMap = {
    script: withDefault(FunctionControl, "return 1 + 1"),
  };
  return new MultiCompBuilder(childrenMap, (props) => {
    const { orgCommonSettings } = getGlobalSettings();
    const runInHost = !!orgCommonSettings?.runJavaScriptInHost;
    return async (p: { args?: Record<string, unknown> }): Promise<QueryResult> => {
      try {
        const timer = performance.now();
        const data = await props.script(p.args, runInHost);
        return {
          data: data,
          code: QUERY_EXECUTION_OK,
          success: true,
          runTime: Number((performance.now() - timer).toFixed()),
        };
      } catch (e) {
        return {
          success: false,
          data: "",
          code: QUERY_EXECUTION_ERROR,
          message: (e as any).message || "",
        };
      }
    };
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          {children.script.propertyView({
            placement: "bottom",
            styleName: "medium",
            width: "100%",
            // language: "sql", // It cannot be set to sql directly, but should be set to sql when the resource type selected by the user is a database
          })}
          {QueryTutorials.js && (
            <DocLink href={QueryTutorials.js}>{trans("query.jsQueryDocLink")}</DocLink>
          )}
        </>
      );
    })
    .build();
})();
