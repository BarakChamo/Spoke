import EditorNodeMixin from "./EditorNodeMixin";
import PhysicalHemisphereLight from "../objects/PhysicalHemisphereLight";

export default class HemisphereLightNode extends EditorNodeMixin(PhysicalHemisphereLight) {
  static legacyComponentName = "hemisphere-light";

  static hideTransform = true;

  static nodeName = "Hemisphere Light";

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);

    const { skyColor, groundColor, intensity } = json.components.find(c => c.name === "hemisphere-light").props;

    node.skyColor.set(skyColor);
    node.groundColor.set(groundColor);
    node.intensity = intensity;

    return node;
  }

  serialize() {
    return super.serialize({
      "hemisphere-light": {
        skyColor: this.skyColor,
        groundColor: this.groundColor,
        intensity: this.intensity
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("hemisphere-light", {
      skyColor: this.skyColor,
      groundColor: this.groundColor,
      intensity: this.intensity
    });
    this.replaceObject();
  }
}
