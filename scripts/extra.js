//stuff related to editing extras through the web interface

function GenExtraCond(data, initialCat, initialOpt, negative, first) {
	let cr = document.getElementById('tmpl-extra-condition').content.cloneNode(true);
	let s1 = cr.querySelector('td:first-child > select');
	let s2 = cr.querySelector('td:nth-child(2) > select');
	for (let cat of data['lists'].map(x => x.category)) {
		let o = document.createElement('option');
		o.textContent = cat;
		if (cat === initialCat) o.setAttribute('selected', '');
		s1.appendChild(o);
	}
	let opts = data['lists'].find(c => { return c.category === initialCat; });
	//opts should be null/undefined only if data.js has a spelling mistake
	if (opts) for (let opt of opts.options) {
		let o = document.createElement('option');
		o.textContent = opt;
		if (opt === initialOpt) o.setAttribute('selected', '');
		s2.appendChild(o);
	}
	if (negative) cr.querySelector('input[type="checkbox"]').setAttribute('checked', '');
	if (!first) cr.querySelector('input[type="checkbox"]').setAttribute('disabled', '');
	if (!first) cr.querySelector('label').classList.add('deactiv');
	return cr;
}

function GenExtraTable(data) {
	let t = document.getElementById('tmpl-table-extra').content.cloneNode(true);
	if (typeof data['extras'] === 'undefined') return t;
	for (let ex of data['extras']) {
		//main
		let r = document.getElementById('tmpl-row-extra').content.cloneNode(true);
		r.querySelector('input[type="text"]').value = ex['name'];
		r.querySelector('input[type="number"]').value = ex['probability'];
		r.querySelector('textarea').textContent = ex['description'];
		let l = r.querySelector('tr:last-child');
		let i = 0;
		if (typeof ex['conditions'] !== 'undefined')
			for (let cond of [].concat(ex['conditions'])) {
				let [precat, preval, negative] = ParseCondition(cond);
				let j = 0;
				for (let v of [].concat(preval)) {
					let cr = GenExtraCond(data, precat, v, negative, j == 0);
					r.insertBefore(cr, l);
					i++;
					j++;
				}
			}
		r.querySelector('td.col-5').setAttribute('rowspan', 3 + i);
		t.querySelector('tbody').appendChild(r);
	}
	return t;
}

function GetExtraIndex(el) {
	//stepping up to the row of the current element (unless it's already a row)
	let row = el.tagName.toLowerCase() == 'tr' ? el : el.closest('tr');
	//getting the closest previous input (that will be current extra's name)
	let inp = row.querySelector('input[type="text"]');
	while (inp === null) {
		row = row.previousElementSibling;
		inp = row.querySelector('input[type="text"]');
	}
	//getting position of this input among all inputs (that would current extra's index)
	let k = 0; 
	let every = el.closest('.t-extra').querySelectorAll('input[type="text"]');
	while (k < every.length && every.item(k) != inp) k++;
	//console.log(k);
	return k;
}

function ChangeExtraName(el) {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let k = GetExtraIndex(el);
	DATA[gameind]['extras'][k]['name'] = el.value;
}

function ChangeExtraDesc(el) {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let k = GetExtraIndex(el);
	DATA[gameind]['extras'][k]['description'] = el.value;
}

function ChangeExtraProb(el) {
	if (parseInt(el.value) > parseInt(el.max)) el.value = el.max;
	if (parseInt(el.value) < parseInt(el.min)) el.value = el.min;
	let gameind = document.getElementById('game-selector').selectedIndex;
	let k = GetExtraIndex(el);
	DATA[gameind]['extras'][k]['probability'] = parseInt(el.value);
}

function RemoveExtraRow(el) {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let k = GetExtraIndex(el);
	let t = el.closest('table');
	let s =	el.closest('tr').rowIndex;
	let n = parseInt(el.closest('td').getAttribute('rowspan'));
	for (let i = 0; i < n; i++) t.deleteRow(s);
	DATA[gameind]['extras'].splice(k, 1);
}

function AddExtraRow() {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let r = document.getElementById('tmpl-row-extra').content.cloneNode(true);
	r.querySelector('input[type="text"]').value = '<Name>';
	r.querySelector('input[type="number"]').value = 0;
	r.querySelector('textarea').textContent = '<Description>';
	r.querySelector('td.col-5').setAttribute('rowspan', 3);
	document.querySelector('.t-extra tbody').appendChild(r);
	let E = DATA[gameind]['extras'];
	if (typeof E === 'undefined') E = [];
	E.push({ name: '<Name>', description: '<Description>', probability: 0 });
	DATA[gameind]['extras'] = E;
}

//stepping back through rows until the first condition in a group
function MoveToFirstCond(tr) {
	while (tr.previousElementSibling.childElementCount == 4) tr = tr.previousElementSibling;
	return tr;
}

function RemoveExtraCond(el) {
	let del = el.closest('tr');
	let tr = del.nextElementSibling;
	del.remove();
	tr = MoveToFirstCond(tr);
	//if no conditions are left after removal, then tr = "add condition" button row
	//and SetNegStates will do nothing, while UpdateExtraCond will set 'conditions' to undefined
	SetNegStates(tr);
	UpdateExtraCond(tr);
	//since one row is removed, decreasing rowspan of rightmost cell by 1
	let rembtn = document.querySelectorAll('.t-extra td.col-5')[GetExtraIndex(tr)];
	rembtn.setAttribute('rowspan', parseInt(rembtn.getAttribute('rowspan')) - 1);
}

function AddExtraCond(el) {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let firstcat = DATA[gameind]['lists'][0]['category'];
	let cr = GenExtraCond(DATA[gameind], firstcat);
	let tr = el.closest('tr');
	document.querySelector('.t-extra tbody').insertBefore(cr, tr);
	tr = MoveToFirstCond(tr);
	SetNegStates(tr);
	UpdateExtraCond(tr);
	//since one row is added, increasing rowspan of rightmost cell by 1
	let rembtn = document.querySelectorAll('.t-extra td.col-5')[GetExtraIndex(tr)];
	rembtn.setAttribute('rowspan', parseInt(rembtn.getAttribute('rowspan')) + 1);
}

//setting NOT checkboxes for repeating categories
function SetNegStates(tr) {
	//tr = 1st row with condition in the group (or "add condition" row if there's none)
	let prevcats = [];
	let prevnegs = [];
	while (tr.childElementCount == 4) {
		let curcat = tr.querySelector('td:first-child select').value;
		if (!prevcats.includes(curcat)) {
			tr.querySelector('label').classList.remove('deactiv');
			tr.querySelector('input[type="checkbox"]').removeAttribute('disabled');
			prevcats.push(curcat);
			prevnegs.push(tr.querySelector('input[type="checkbox"]').checked);
		}
		else {
			let checkState = prevnegs[prevcats.indexOf(curcat)];
			tr.querySelector('label').classList.add('deactiv');
			tr.querySelector('input[type="checkbox"]').setAttribute('disabled', '');
			tr.querySelector('input[type="checkbox"]').checked = checkState;
		}
		tr = tr.nextElementSibling;
	}
}

//writing "conditions" for "extras" to DATA from current states in DOM
//(easier to write anew than to program all individual change places)
function UpdateExtraCond(tr) {
	//tr = 1st row with condition in the group (or "add condition" row if there's none)
	let prev = [];
	let cond = [];
	while (tr.childElementCount == 4) {
		let cat = tr.querySelector('td:first-child select').value;
		let val = tr.querySelector('td:nth-child(2) select').value;
		let neg = tr.querySelector('input[type="checkbox"]').checked;
		if (!prev.includes(cat)) {
			let c = {};
			c[cat] = val;
			if (neg) c['type'] = 'negative';
			prev.push(cat);
			cond.push(c);
		}
		else {
			let c = cond.find(c => { return c.hasOwnProperty(cat); });
			c[cat] = [].concat(c[cat]).concat(val);
		}
		tr = tr.nextElementSibling;
	}
	cond = cond.length == 0 ? 'undefined' : (cond.length > 1 ? cond : cond[0]);
	let gameind = document.getElementById('game-selector').selectedIndex;
	let k = GetExtraIndex(tr);
	DATA[gameind]['extras'][k]['conditions'] = cond;
	//console.log(DATA[gameind]['extras']);
}

function ChangeExtraCondCat(el) {
	//category changed -> need to load different options into the 2nd dropdown
	let gameind = document.getElementById('game-selector').selectedIndex;
	let options = DATA[gameind]['lists'].find(c => { return c.category === el.value; }).options;
	let s = el.closest('tr').querySelector('td:nth-child(2) select');
	while (s.firstChild) s.firstChild.remove();
	for (let opt of options) {
		let o = document.createElement('option');
		o.textContent = opt;
		s.appendChild(o);
	}
	let tr = MoveToFirstCond(el.closest('tr'));
	SetNegStates(tr);
	UpdateExtraCond(tr);
}

function ChangeExtraCondOpt(el) {
	let tr = MoveToFirstCond(el.closest('tr'));
	UpdateExtraCond(tr);
}

function ChangeExtraNeg(el) {
	//setting all checkboxes for the same category as well (if there's any)
	let tr = el.closest('tr');
	let cat = tr.querySelector('td:first-child select').value;
	tr = MoveToFirstCond(tr);
	let ftr = tr;
	while (tr.childElementCount == 4) {
		let cb = tr.querySelector('input[type="checkbox"]');
		let vl = tr.querySelector('td:first-child select').value;
		if (cb != el && vl == cat) cb.checked = el.checked;
		tr = tr.nextElementSibling;
	}
	UpdateExtraCond(ftr);
}