const { test } = require('@kmamal/testing')
const { rand } = require('@kmamal/util/random/rand')
const { sortBy } = require('@kmamal/util/array/sort')
const { sub } = require('@kmamal/util/operators')

const { BalancedTree } = require('.')

test("structs.balanced-tree", (t) => {
	const a = new BalancedTree(sub)
	const b = new Map()

	const K = 100
	const V = 1000
	const R = 1000
	for (let i = 0; i < R; i++) {
		if (rand(2)) {
			const key = rand(K)
			const value = rand(V)
			// console.log('set', key, value) //
			a.set(key, value)
			b.set(key, value)
		} else {
			const key = rand(K)
			// console.log('delete', key) //
			a.delete(key)
			b.delete(key)
		}
		// a._print() //

		t.equal(a.size, b.size)

		for (let key = 0; key < K; key++) {
			t.equal(a.has(key), b.has(key), { key })
			t.equal(a.get(key), b.get(key), { key })
		}

		const aEntries = sortBy([ ...a.entries() ], ([ key ]) => key)
		const bEntries = sortBy([ ...b.entries() ], ([ key ]) => key)
		t.equal(aEntries, bEntries)
	}
})
