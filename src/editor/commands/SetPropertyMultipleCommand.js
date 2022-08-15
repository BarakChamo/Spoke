import Command from './Command'
import arrayShallowEqual from '../utils/arrayShallowEqual'
import { serializeObject3DArray, serializeProperty } from '../utils/debug'

export default class SetPropertyMultipleCommand extends Command {
  constructor(editor, objects, propertyName, value, target) {
    super(editor)

    this.objects = objects.slice(0)
    this.propertyName = propertyName
    this.target = target

    if (value && value.clone) {
      this.newValue = value.clone()
    } else {
      this.newValue = value
    }

    this.oldValues = this.objects.map(object => {
      const oldValue = target ? object[target][propertyName] : object[propertyName]
      return oldValue && oldValue.clone ? oldValue.clone() : oldValue
    })
  }

  execute() {
    this.editor.setPropertyMultiple(this.objects, this.propertyName, this.newValue, false, true, this.target)
  }

  shouldUpdate(newCommand) {
    return this.propertyName === newCommand.propertyName && arrayShallowEqual(this.objects, newCommand.objects)
  }

  update(command) {
    const newValue = command.newValue

    if (newValue && newValue.clone && newValue.copy) {
      this.newValue = newValue.clone()
    } else {
      this.newValue = newValue
    }

    this.editor.setPropertyMultiple(this.objects, this.propertyName, this.newValue, false, true, this.target)
  }

  undo() {
    for (let i = 0; i < this.objects.length; i++) {
      this.editor.setProperty(this.objects[i], this.propertyName, this.oldValues[i], false, false, this.target)
    }

    this.editor.emit('objectsChanged', this.objects, this.propertyName)
  }

  toString() {
    return `SetPropertyMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.objects)} propertyName: ${
      this.propertyName
    } newValue: ${serializeProperty(this.newValue)}`
  }
}
