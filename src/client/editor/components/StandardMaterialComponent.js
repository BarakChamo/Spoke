import SaveableComponent from "./SaveableComponent";
import { types, getFilePath } from "./utils";
import THREE from "../../vendor/three";
import envMapURL from "../../assets/envmap.jpg";

const imageFilters = [".jpg", ".png"];
const textureLoader = new THREE.TextureLoader();
export default class StandardMaterialComponent extends SaveableComponent {
  static componentName = "standard-material";

  static schema = [
    { name: "color", type: types.color, default: "white" },
    { name: "emissiveFactor", type: types.color, default: "white" },
    { name: "metallic", type: types.number, default: 1 },
    { name: "roughness", type: types.number, default: 1 },
    { name: "alphaCutoff", type: types.number, default: 0.5 },
    { name: "doubleSided", type: types.boolean, default: false },
    { name: "baseColorTexture", type: types.file, default: "", filters: imageFilters },
    { name: "normalTexture", type: types.file, default: "", filters: imageFilters },
    { name: "metallicRoughnessTexture", type: types.file, default: "", filters: imageFilters },
    { name: "emissiveTexture", type: types.file, default: "", filters: imageFilters },
    { name: "occlusionTexture", type: types.file, default: "", filters: imageFilters }
    // TODO alphaMode
  ];

  constructor() {
    super(".material");
  }

  _loadTexture(url) {
    try {
      return textureLoader.load(url);
    } catch (e) {
      return null;
      // TODO Should show warning on texture property when this happens.
    }
  }

  updateProperty(propertyName, value) {
    super.updateProperty(propertyName, value);
    let texture;
    switch (propertyName) {
      case "color":
        this._object.color.set(value);
        break;
      case "emissiveFactor":
        this._object.emissive.set(value);
        break;
      case "metallic":
        this._object.metalness = value;
        this._object.needsUpdate = true;
        break;
      case "alphaCutoff":
        this._object.alphaTest = value;
        this._object.needsUpdate = true;
        break;
      case "doubleSided":
        this._object.side = value ? THREE.DoubleSide : THREE.FrontSide;
        break;
      case "baseColorTexture":
        this._object.map = this._loadTexture(value);
        this._object.needsUpdate = true;
        break;
      case "normalTexture":
        this._object.normalMap = this._loadTexture(value);
        this._object.needsUpdate = true;
        break;
      case "metallicRoughnessTexture":
        texture = this._loadTexture(value);
        this._object.roughnessMap = texture;
        this._object.metalnessMap = texture;
        this._object.needsUpdate = true;
        break;
      case "emissiveTexture":
        this._object.emissiveMap = this._loadTexture(value);
        this._object.needsUpdate = true;
        break;
      case "occlusionTexture":
        this._object.aoMap = this._loadTexture(value);
        this._object.needsUpdate = true;
        break;
      default:
        this._object[propertyName] = value;
    }
  }

  static _propsFromObject(node) {
    const { map, normalMap, emissiveMap, roughnessMap, aoMap } = node.material;
    return {
      color: node.material.color.getStyle(),
      emissiveFactor: node.material.emissive.getStyle(),
      metallic: node.material.metalness,
      roughness: node.material.roughness,
      alphaCutoff: node.material.alphaTest,
      doubleSided: node.material.side === THREE.DoubleSide,
      baseColorTexture: (map && getFilePath(map.image)) || "",
      normalTexture: (normalMap && getFilePath(normalMap.image)) || "",
      metallicRoughnessTexture: (roughnessMap && getFilePath(roughnessMap.image)) || "",
      emissiveTexture: (emissiveMap && getFilePath(emissiveMap.image)) || "",
      occlusionTexture: (aoMap && getFilePath(aoMap.image)) || ""
    };
  }

  static inflate(node, _props) {
    const { component } = this._getOrCreateComponent(node, _props);
    const texture = new THREE.TextureLoader().load(envMapURL);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    node.material.envMap = texture;
    node.material.needsUpdate = true;
    Object.defineProperty(component, "_object", { enumerable: false, value: node.material });
    return component;
  }
}
