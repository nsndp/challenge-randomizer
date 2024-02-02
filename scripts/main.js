//https://www.debigare.com/randomizers/
//github pages: https://stackoverflow.com/a/40913384

STOR_VAR_T = 'challenge_randomizer_theme';
STOR_VAR_D = 'challenge_randomizer_data';
STOR_VAR_H = 'challenge_randomizer_hash';

function SetGamesList(data) {
	let cont = document.getElementById('game-selector');
	let i = 0;
	for (let name of data.map(x => x['game'])) {
		let opt = document.createElement('option');
		opt.textContent = name;
		if (data[i]['preselected'] === 'YES') opt.setAttribute('selected', '');
		cont.appendChild(opt);
		i++;
	}
}

function shuffle(a) {
	let i = a.length;
	while (i > 0) {
		let k = Math.floor(Math.random() * i);
		i--;
		[a[i], a[k]] = [a[k], a[i]];
	}
	return a;
}

function CreateImages(holder, arr) {
	let cont = document.getElementById(holder);
	while (cont.firstChild) cont.firstChild.remove();
	let paths = arr.map(x => 'arts/' + x);
	paths = shuffle(paths);
	for (let i = 0; i < paths.length; i++) {
		let img = document.createElement('img');
		img.classList.add('art');
		img.setAttribute('src', paths[i]);
		cont.appendChild(img);
	}
}

function LoadImages(data) {
	let prim = data['arts']['primary'];
	let seco = data['arts']['secondary'];
	CreateImages('art-container', prim);	
	let css = document.documentElement.style;
	css.setProperty('--art-display-width', data['arts']['primary-width'] + 'px');
	css.setProperty('--art-display-height', data['arts']['primary-height'] + 'px');
	if (typeof seco !== 'undefined') {
		CreateImages('art-container-moar', seco);
		css.setProperty('--secondary-art-display-width', data['arts']['secondary-width'] + 'px');
	}
}

function ChangeGame() {
	let selector = document.getElementById('game-selector');
	Generate(DATA[selector.selectedIndex]);
	for (let i = 0; i < DATA.length; i++) {
		if (i != selector.selectedIndex) delete DATA[i]['preselected'];
		else DATA[i]['preselected'] = 'YES';
	}
	//reverting to default page state, i.e. hiding options and clearing what was generated
	if (document.getElementById('lists-container').style.display !== 'none') ToggleOptions();
	if (document.getElementById('result-container').childElementCount > 0) ClearResult();
}

function ToggleOptions() {
	let zone = document.getElementById('customization-container');
	let btxt = document.getElementById('btn-customize');
	let cont = document.getElementById('lists-container');
	let flag = cont.style.display === 'none';
	zone.classList.toggle('collapsed');
	btxt.textContent = flag ? 'Hide all options' : 'Customize';
	cont.style.display = flag ? '' : 'none';
}

function ToggleOnOff(el) {
	let hdr = el.closest('.cat-header');
	let cat = hdr.nextElementSibling;
	let btn = hdr.getElementsByTagName('button')[0];
	cat.style.display = 'none';
	btn.style.display = el.checked ? '' : 'none';
	btn.textContent = 'show';
	if (el.checked) el.parentElement.classList.remove('deactiv');
	else el.parentElement.classList.add('deactiv');
	let gameind = document.getElementById('game-selector').selectedIndex;
	if (el.nextElementSibling.textContent !== 'Extra') {
		//updating DATA
		let headers = hdr.parentNode.querySelectorAll('.cat-header');
		let catind = Array.from(headers).indexOf(hdr);
		DATA[gameind]['lists'][catind]['state'] = el.checked ? 'ON' : 'OFF';
	}
	else {
		hdr.querySelector('.hint').style.display = el.checked ? '' : 'none';
		//updating DATA
		DATA[gameind]['extras-state'] = el.checked ? 'ON' : 'OFF';
	}
}

function ToggleCategory(el, id) {
	let ct = el.parentNode.nextElementSibling;
	ct.style.display = ct.style.display === 'none' ? '' : 'none';
	el.textContent = el.textContent === 'show' ? 'hide' : 'show';
}

function UpdateProbs(el) {
	if (Number(el.value) > Number(el.max)) el.value = el.max;
	if (Number(el.value) < Number(el.min)) el.value = el.min;
	let table = el.closest('table');
	let isMult = table.classList.contains('mult');
	let gameind = document.getElementById('game-selector').selectedIndex;
	let odds = Array.from(table.querySelectorAll('input')).map(x => Number(x.value));
	osum = odds.reduce((s, a) => s + a, 0);
	for (let i = 1; i < table.rows.length; i++) {
		let prob = Math.round(odds[i - 1] / osum * 100);
		let cell = table.rows[i].querySelector('td:last-child');
		cell.textContent = isNaN(prob) ? '-' : (prob + '%');
	}
	//updating DATA
	let c = table.parentNode;
	let containers = c.parentNode.querySelectorAll('div.cat-container');
	let catind = Array.from(containers).indexOf(c);
	if (isMult) DATA[gameind]['lists'][catind]['multiple']['odds'] = odds;
	else DATA[gameind]['lists'][catind]['odds'] = odds;
}

function NumberSub(el, extra = false) {
	let inp = el.nextElementSibling;
	inp.value = Math.max(Number(inp.min), Number(inp.value) - 1);
	if (!extra) UpdateProbs(inp);
	else ChangeExtraProb(el);
}

function NumberAdd(el, extra = false) {
	let inp = el.previousElementSibling;
	inp.value = Math.min(Number(inp.max), Number(inp.value) + 1);
	if (!extra) UpdateProbs(inp);
	else ChangeExtraProb(el);
}

function GenCategoryContainer() {
	let d = document.createElement('div');
	d.classList.add('cat-container');
	d.style.display = 'none';
	return d;
}

function GenCategoryHeader(name, state) {
	let h = document.getElementById('tmpl-cat-header').content.cloneNode(true);
	h.querySelector('span').textContent = name;
	if (state === 'OFF') h.querySelector('label').classList.add('deactiv');
	if (state !== 'OFF') h.querySelector('input').setAttribute('checked', '');	
	if (state === 'OFF') h.querySelector('button').style.display = 'none';
	if (name == 'Extra') {
		let p = document.getElementById('tmpl-cat-header-extra-hint').content.cloneNode(true);
		h.querySelector('.cat-header').appendChild(p);
		h.querySelector('.cat-header').classList.add('hint-coord-base');
		if (state === 'OFF') h.querySelector('.hint-prep').classList.add('hint-to-hide');
	}
	return h;
}

function GenConditionText(conditions) {
	let txt = [];
	for (let con of [].concat(conditions)) {
		let neg = 'type' in con && con['type'] === 'negative';
		let categ = Object.keys(con)[0];
		let optss = [].concat(Object.values(con)[0]);
		txt.push((neg ? 'NOT ' : '') + categ + ' = ' + optss.join(' or '));
	}
	return txt.map(x => '[' + x + ']').join(' and ');
}

function GenProbTable(options, customOdds, isMult = false) {
	let tname = !isMult ? 'tmpl-table' : 'tmpl-table-mult';
	let t = document.getElementById(tname).content.cloneNode(true);
	let osum = typeof customOdds !== 'undefined'
		? customOdds.reduce((s, a) => s + a, 0)
		: options.length;
	for (let i = 0; i < options.length; i++) {
		let odds = typeof customOdds !== 'undefined' ? customOdds[i] : 1;
		let prob = Math.round(odds / osum * 100);
		let r = document.getElementById('tmpl-row').content.cloneNode(true);
		r.querySelector('input').setAttribute('value', odds);
		r.querySelector('td:first-child').textContent = options[i];
		r.querySelector('td:last-child').textContent = prob + '%';
		t.querySelector('tbody').appendChild(r);
	}
	return t;
}

function Generate(data) {
	let L = document.getElementById('lists-container');
	while (L.firstChild) L.firstChild.remove(); //clearing previous (if present)
	for (let list of data['lists']) {
		L.appendChild(GenCategoryHeader(list['category'], list['state']));
		let B = GenCategoryContainer();
		if (typeof list['conditions'] !== 'undefined') {
			let C = document.getElementById('tmpl-cat-condition').content.cloneNode(true);
			C.querySelector('span:last-child').textContent = GenConditionText(list['conditions']);
			B.appendChild(C);
		}
		if (typeof list['multiple'] !== 'undefined') {
			let numbers = {length: list['multiple']['max']};
			let options = Array.from(numbers, (x, i) => (i + 1) + ' options');
			options[0] = '1 option'; // changing 'options' to 'option' for 1
			if (list['multiple']['zero'] === 'YES') options.splice(0, 0, 'Do not select');
			B.appendChild(GenProbTable(options, list['multiple']['odds'], true));
		}
		B.appendChild(GenProbTable(list['options'], list['odds']));
		L.appendChild(B);
	}
	//extras
	L.appendChild(GenCategoryHeader('Extra', data['extras-state']));
	let B = GenCategoryContainer();
	B.appendChild(GenExtraTable(data));
	L.appendChild(B);
	//other
	LoadImages(data);
	PrepHints();
}

function ParseCondition(cond) {
	let precat, preval, negative = false;
	for (let prop in cond) {
		if (prop == "type" && cond[prop] == "negative") negative = true;
		else { precat = prop; preval = cond[prop]; }
	}
	return [precat, preval, negative];
}

function ConditionsSatisfied(conds, cats, sels) {
	let carr = [].concat(conds); //converting to array (needed if one element)
	let res = true;
	let c = 0;
	while (res && c < carr.length) {
		let [precat, preval, negative] = ParseCondition(carr[c]);
		//searching previously selected categories to check the condition
		let idx = [], i = -1;
		while ((i = cats.indexOf(precat, i + 1)) != -1) idx.push(i);
		let match = false;
		if (idx.length > 0) {
			let comp = [];
			for (i = 0; i < idx.length; i++) comp.push(sels[idx[i]]);
			if (!(preval instanceof Array)) match = comp.includes(preval);
			else for (let v of preval) if (comp.includes(v)) match = true;
		}
		if (!match && !negative) res = false;
		if (match && negative) res = false;
		c++;
	}
	return res;
}

function MakeSelection(odds) {
	let pool = [];
	for (let i = 0; i < odds.length; i++)
		for (let j = 0; j < odds[i]; j++)
			pool.push(i);
	let ind = Math.floor(Math.random() * pool.length);
	return pool[ind];
}

function CreateChallenge() {
	let gameind = document.getElementById('game-selector').selectedIndex;
	let cats = [], inds = [], sels = [];
	for (let list of DATA[gameind]['lists']) {
		if (typeof list['state'] !== 'undefined' && list['state'] === 'OFF') continue;
		if (typeof list['conditions'] !== 'undefined' &&
			!ConditionsSatisfied(list['conditions'], cats, sels)) continue;
		let options = Array.from(list['options']);
		let odds = list['odds'] ? Array.from(list['odds']) : Array(options.length).fill(1);
		let times = 1;
		let different = false;
		if (typeof list['multiple'] !== 'undefined') { //if selecting multiple times
			let max = Number(list['multiple']['max']);
			let zero = list['multiple']['zero'] === 'YES';
			let multodds = list['multiple']['odds'] ?? Array(max + Number(zero ? 1 : 0)).fill(1);
			times = MakeSelection(multodds) + Number(zero ? 0 : 1);
			different = list['multiple']['same'] !== 'YES';
		}
		for (let k = 0; k < times; k++) {
			let sel = MakeSelection(odds);
			cats.push(list['category']);
			inds.push(times == 1 ? null : k + 1); //to know if to add 1,2... at the end or not
			sels.push(options[sel]);
			if (different) { //removing what's selected if multiple options need to be different
				options.splice(sel, 1);
				odds.splice(sel, 1);
			}
		}
	}
	let R = document.getElementById('result-container');
	while (R.firstChild) R.firstChild.remove();
	for (let i = 0; i < cats.length; i++) {
		let line = document.getElementById('tmpl-result-line').content.cloneNode(true);
		let catn = cats[i] + (inds[i] != null ? ' ' + inds[i] : '');
		line.querySelector('span:first-child').textContent = catn;
		line.querySelector('span:last-child').textContent = sels[i];
		R.appendChild(line);
	}
	if (DATA[gameind]['extras-state'] !== 'OFF' && typeof DATA[gameind]['extras'] !== 'undefined') {
		let extras = [];
		for (let ex of DATA[gameind]['extras']) {
			if (typeof ex['conditions'] !== 'undefined' &&
				!ConditionsSatisfied(ex['conditions'], cats, sels)) continue;
			if (Math.floor(Math.random() * 100) + 1 <= ex['probability']) extras.push(ex);
		}
		if (extras.length > 0) {
			let h = document.createElement('div');
			h.classList.add('extras-header');
			h.textContent = 'Extra';
			R.appendChild(h);
			for (let ex of extras) {
				let e = document.getElementById('tmpl-result-extra').content.cloneNode(true);
				e.querySelector('span:first-child').textContent = ex['name'];
				e.querySelector('span:last-child').textContent = ex['description'];
				R.appendChild(e);
			}
		}
	}
	R.style.display = '';
	document.getElementById('generation-container').classList.remove('collapsed');
	document.getElementById('btn-generate').textContent = 'Regenerate';
	document.getElementById('btn-clear').style.display = '';
}

function ClearResult() {
	let cont = document.getElementById('result-container');
	while (cont.firstChild) cont.firstChild.remove();
	cont.style.display = 'none';
	document.getElementById('generation-container').classList.add('collapsed');
	document.getElementById('btn-generate').textContent = 'Generate';
	document.getElementById('btn-clear').style.display = 'none';
}

function InitTheme(t) {
	let prefdark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	if (!t) {
		t = prefdark ? 'DARK' : 'LIGHT';
		localStorage.setItem(STOR_VAR_T, t);
	}
	if (t === 'DARK') document.body.classList.add('dark');
}

function ToggleTheme(el) {
	document.body.classList.toggle('dark');
	el.classList.toggle('dark');
	let t = document.body.classList.contains('dark') ? 'DARK' : 'LIGHT';
	localStorage.setItem(STOR_VAR_T, t);
	console.log('set to', t);
}

function PrepHints() {
	for (let prep of document.querySelectorAll('.hint-prep')) {
		let tmpl = document.getElementById('tmpl-hint').content.cloneNode(true);
		let targ = tmpl.querySelector('.popup-text');
		while (prep.firstChild) targ.appendChild(prep.firstChild);
		for (let i = 1; i < targ.childElementCount; i++) targ.children[i].style.display = 'none';
		let hint = tmpl.querySelector('.hint');
		if (prep.classList.contains('extra')) hint.classList.add('extra');
		if (prep.classList.contains('hint-to-hide')) hint.style.display = 'none';
		prep.parentNode.appendChild(tmpl);
		prep.remove();
	}
}

function ShowHint(el) {
	let pB = el.nextElementSibling;
	let pT = pB.querySelector('.popup-text');
	if (!pB.classList.contains('shown')) {
		let active = document.querySelectorAll('.popup-block.shown');
		for (let act of active) act.classList.remove('shown'); //closing any other open hints
		pB.classList.add('shown');
		if (pT.childElementCount > 1) {
			//if multiple spans are inside .popup-text, resetting the 1st as visible
			pT.children[0].style.display = '';
			for (let i = 1; i < pT.childElementCount; i++) pT.children[i].style.display = 'none';
		}
		pB.querySelector('.arrow').style.display = pT.childElementCount == 1 ? 'none' : '';
	}
}

function CloseHint(el) {
	el.closest('.popup-block').classList.remove('shown');
}

function ShowNextHintPart(el) {
	let parts = el.closest('.popup-block').querySelector('.popup-text').children;
	let i = 0;
	while (parts[i].style.display === 'none') i++;
	parts[i].style.display = 'none';
	i++;
	parts[i].style.display = '';
	if (i == parts.length - 1) el.style.display = 'none';
}

//https://stackoverflow.com/a/8831937
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

window.addEventListener('DOMContentLoaded', function() {
	let t = localStorage.getItem(STOR_VAR_T);
	let d = localStorage.getItem(STOR_VAR_D);
	let h1 = localStorage.getItem(STOR_VAR_H);
	let h2 = hashCode(JSON.stringify(DATA));
	//if there's both DATA and its string hash in local storage
	//and that stored hash is the same as current DATA from data.js
	//then it means data.js wasn't modified, and we can proceed to load user's customizations
	//but if not (i.e. github.io version was updated or user is editing data.js locally),
	//then data.js changes take precedence and overwrite previous storage saves
	//console.log(h1);
	//console.log(h2);
	if (d && h1 && h1 == h2) {
		DATA = JSON.parse(d);
		//console.log('DATA loaded from storage');
	}
	if (!h1 || h1 != h2) {
		localStorage.setItem(STOR_VAR_H, h2);
		//console.log('DATA loaded from disk, new hash is saved');
	}
	InitTheme(t);
	SetGamesList(DATA);
	Generate(DATA.find(c => { return c['preselected'] === 'YES'; }));
});

window.addEventListener("beforeunload", function() {
	localStorage.setItem(STOR_VAR_D, JSON.stringify(DATA));
});