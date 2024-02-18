
const getKey = ({ key }) => key
const getValue = ({ value }) => value
const getEntry = ({ key, value }) => [ key, value ]

class BalancedTree {
	constructor (fnCmp) {
		this._fnCmp = fnCmp
		this._root = null
		this._size = 0
	}

	get size () { return this._size }

	has (key) { return this._has(this._root, key) }
	_has (node, key) {
		if (!node) { return false }
		const cmp = this._fnCmp(node.key, key)
		if (cmp === 0) { return true }
		return cmp > 0 ? this._has(node.left, key) : this._has(node.right, key)
	}

	get (key) { return this._get(this._root, key) }
	_get (node, key) {
		if (!node) { return undefined }
		const cmp = this._fnCmp(node.key, key)
		if (cmp === 0) { return node.value }
		return cmp > 0 ? this._get(node.left, key) : this._get(node.right, key)
	}

	set (key, value) { return this._set(this._root, null, undefined, key, value) }
	_set (node, parent, parentCmp, key, value) {
		if (!node) {
			const child = { key, value, weight: 1, left: null, right: null }

			if (parent) {
				if (parentCmp > 0) {
					parent.left = child
				} else {
					parent.right = child
				}
			} else {
				this._root = child
			}

			this._size += 1
			return true
		}

		const cmp = this._fnCmp(node.key, key)
		if (cmp === 0) {
			node.value = value
			return false
		}

		const created = cmp > 0
			? this._set(node.left, node, cmp, key, value)
			: this._set(node.right, node, cmp, key, value)

		if (created) { this._rebalance(node, parent, parentCmp) }

		return created
	}

	delete (key) { return this._delete(this._root, null, undefined, key) }
	_delete (node, parent, parentCmp, key) {
		if (!node) { return false }
		const cmp = this._fnCmp(node.key, key)
		if (cmp === 0) {
			this._removeNode(node, parent, parentCmp)

			if (parent) {
				parent.weight -= 1
			}

			this._size -= 1
			return true
		}

		const deleted = cmp > 0
			? this._delete(node.left, node, cmp, key)
			: this._delete(node.right, node, cmp, key)

		if (deleted) { this._rebalance(node, parent, parentCmp) }

		return deleted
	}

	_removeNode (node, parent, parentCmp) {
		let replacementParent = node
		let replacement = null
		let replacementCmp

		if (node.right) {
			replacement = node.right
			replacementCmp = -1
			while (replacement.left) {
				replacementParent = replacement
				replacement = replacement.left
				replacementCmp = 1
			}
		} else if (node.left) {
			replacement = node.left
			replacementCmp = 1
			while (replacement.right) {
				replacementParent = replacement
				replacement = replacement.right
				replacementCmp = -1
			}
		}

		if (replacement) {
			this._removeNode(replacement, replacementParent, replacementCmp)

			replacement.left = node.left
			replacement.right = node.right
		}

		if (parent) {
			if (parentCmp > 0) {
				parent.left = replacement
			} else {
				parent.right = replacement
			}
		} else {
			this._root = replacement
		}

		if (replacement) { this._rebalance(replacement, parent, parentCmp) }
	}

	* keys () { yield* this._visit(this._root, getKey) }
	* values () { yield* this._visit(this._root, getValue) }
	* entries () { yield* this._visit(this._root, getEntry) }

	* _visit (node, visitor) {
		if (!node) { return }
		yield* this._visit(node.left, visitor)
		yield visitor(node)
		yield* this._visit(node.right, visitor)
	}

	_rebalance (node, parent, parentCmp) {
		const leftWeight = node.left?.weight || 0
		const rightWeight = node.right?.weight || 0
		node.weight = leftWeight + rightWeight + 1

		const ratio = leftWeight / rightWeight

		if (ratio < 1 / 2 && rightWeight > 1) {
			this._rotateLeft(node, parent, parentCmp)
		} else if (ratio > 2 && leftWeight > 1) {
			this._rotateRight(node, parent, parentCmp)
		}
	}

	_rotateLeft (node, parent, parentCmp) {
		const { right } = node

		if (parent) {
			if (parentCmp > 0) {
				parent.left = right
			} else {
				parent.right = right
			}
		} else {
			this._root = right
		}

		const middleSubtree = right.left
		right.left = node
		node.right = middleSubtree

		const rightWeight = right.weight
		const midWeight = middleSubtree?.weight || 0
		node.weight = (node.weight - rightWeight) + midWeight
		right.weight = (rightWeight - midWeight) + node.weight
	}

	_rotateRight (node, parent, parentCmp) {
		const { left } = node

		if (parent) {
			if (parentCmp > 0) {
				parent.left = left
			} else {
				parent.right = left
			}
		} else {
			this._root = left
		}

		const middleSubtree = left.right
		left.right = node
		node.left = middleSubtree

		const leftWeight = left.weight
		const midWeight = middleSubtree?.weight || 0
		node.weight = (node.weight - leftWeight) + midWeight
		left.weight = (leftWeight - midWeight) + node.weight
	}

	_print () {
		const _print = (node, indent) => {
			if (!node) { return }
			_print(node.right, `${indent} `)
			console.log(`${indent}${node.key}(${node.weight})`)
			_print(node.left, `${indent} `)
		}
		_print(this._root, '')
	}
}

module.exports = { BalancedTree }
