import { Fragment } from "react";
import ModelGroup from "./ModelGroup";

export default function ModelList({
  models,
  currentModel,
  changeModel,
  disabled,
}: {
  models: string[],
  currentModel: string,
  changeModel: (model: string) => void,
  disabled: boolean,
}) {
  const groups = models.map((model) => model.split("/")[0])
                      .filter((elem, index, arr) => arr.indexOf(elem) == index);

  return (
    <Fragment>
    {groups.map((group, index) => (
      <Fragment key={group}>
      {index != 0 &&
        <div style={{
          borderTop: "1px solid #FFFFFF",
          opacity: "19%",
          margin: "30px 0px",
        }}></div>
      }
        <ModelGroup
          group={group}
          models={models.filter((model) => model.startsWith(group))}
          currentModel={currentModel}
          changeModel={changeModel}
          disabled={disabled}
        />
      </Fragment>
    ))}
    </Fragment>
  );
}