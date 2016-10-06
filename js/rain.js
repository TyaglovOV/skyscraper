/**
 * Created by ksyu on 03.10.16.
 */

'use strict';

function RainDrop(canvas, alphabet, fontSize, rows, columns, bgColor, defaultColor, rareColor, rarityRate) {
	this.canvas = canvas;
	this.alphabet = alphabet;
	this.fontSize = fontSize;
	this.rows = rows;
	this.columns = columns;

	this.BG_COLOR = bgColor;
	this.DEFAULT_COLOR = '#' + defaultColor;
	this.RARE_COLOR = '#' + rareColor;
  this.RARITY_RATE = rarityRate;
	this.color = this.DEFAULT_COLOR;

	//зависит от направления. написано для down
	this.rowDropCounter = 0; //счетчик падения. высчитывается исходя из количества строк.
	// когда он становится больше количества строк -- капля насинает свой путь заново
	this.columnDropCounter = 0; //столбец капли. когда счетчик обнуляется, мы выбираем новый рандомом

	this.fallFromTheSky = this.fallFromTheSky.bind(this);
	this.initializeVariables = this.initializeVariables.bind(this);
	this.paintRare = this.paintRare.bind(this);
	this.iterationReset = this.iterationReset.bind(this);
	this.recalcVariables = this.recalcVariables.bind(this);
}

RainDrop.prototype.initializeVariables = function () {
	this.DEFAULT_FONT_STYLE = this.fontSize + 'px arial';
	this.RARE_FONT_STYLE = 'bold' + this.fontSize + 'px arial';
	this.fontStyle = this.DEFAULT_FONT_STYLE;

	this.DEFAULT_FONT_SHADOW = 'rgb(' + this.BG_COLOR + ')';
	this.RARE_FONT_SHADOW = this.RARE_COLOR;
	this.fontShadowColor = this.DEFAULT_FONT_SHADOW;

	this.DEFAULT_SHADOW_BLUR = 15;
	this.RARE_SHADOW_BLUR = 20;
	this.fontShadowBlur = this.DEFAULT_SHADOW_BLUR;
};

RainDrop.prototype.fallFromTheSky = function (fallDirection) {

	//рандомный символ, что берем из массива с алфавитом
	var textCharacter = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
	this.canvas.fillStyle = this.color;
	this.canvas.font = this.fontStyle;


	//фонт шедоу -- светящиеся буквы, ня
	this.canvas.shadowColor = this.fontShadowColor;
	this.canvas.shadowOffsetX = 0;
	this.canvas.shadowOffsetY = 0;
	this.canvas.shadowBlur = this.fontShadowBlur;

	//рисуем наш символ по координатам, где x -- это наш счетчик, а y -- это наш столбец. зависит от направления
	switch (fallDirection) {
		case 'down':
			this.canvas.fillText(textCharacter, this.columnDropCounter * this.fontSize, this.rowDropCounter * this.fontSize);
			//обнуление шедоу, штобы не заливало все к ебеням
			this.canvas.shadowBlur = 0;
      //ессли капля вышла за пределы поля
			if (this.rowDropCounter > this.rows) {
				//резетаем нашу каплю на рандомное место в поле по вертикали
				this.rowDropCounter = Math.floor((Math.random() * this.rows) - (this.rows / 2));
				//по горизонтали
				this.columnDropCounter = Math.floor(Math.random() * this.columns);
				this.iterationReset();
			}
			//	увеличение счетчика капли.
			this.rowDropCounter++;
			break;

		case 'up':
			this.canvas.fillText(textCharacter, this.columnDropCounter * this.fontSize, this.rowDropCounter * this.fontSize);
			this.canvas.shadowBlur = 0;
			if (this.rowDropCounter < 0) {
				this.rowDropCounter = Math.floor(Math.random() * this.rows * 2);
				this.columnDropCounter = Math.floor(Math.random() * this.columns);
				this.iterationReset();
			}
			this.rowDropCounter--;
			break;

		case 'right':
			this.canvas.fillText(textCharacter, this.columnDropCounter * this.fontSize, this.rowDropCounter * this.fontSize);
			this.canvas.shadowBlur = 0;
			if (this.columnDropCounter > this.columns) {
				this.rowDropCounter = Math.floor(Math.random() * this.rows);
				this.columnDropCounter = Math.floor((Math.random() * this.columns) - (this.columns / 2));
				this.iterationReset();
			}
			this.columnDropCounter++;
			break;

		case 'left':
			this.canvas.fillText(textCharacter, this.columnDropCounter * this.fontSize, this.rowDropCounter * this.fontSize);
			this.canvas.shadowBlur = 0;
			if (this.columnDropCounter < 0) {
				this.rowDropCounter = Math.floor(Math.random() * this.rows);
				this.columnDropCounter = Math.floor(Math.random() * this.columns * 2);
				this.iterationReset();
			}
			this.columnDropCounter--;
			break;
	}
};

RainDrop.prototype.iterationReset = function () {
	//сбрасываем все на дефолт, после запускам функцию РЕДКИХ строк
	this.color = this.DEFAULT_COLOR;
	this.fontStyle = this.DEFAULT_FONT_STYLE;
	this.fontShadowColor = this.DEFAULT_FONT_SHADOW;
	this.fontShadowBlur = this.DEFAULT_SHADOW_BLUR;
	this.paintRare();
};

RainDrop.prototype.paintRare = function () {
  if (Math.random() > this.RARITY_RATE) {
    this.color = this.RARE_COLOR;
    this.fontStyle = this.RARE_FONT_STYLE;
    this.fontShadowColor = this.RARE_FONT_SHADOW;
    this.fontShadowBlur = this.RARE_SHADOW_BLUR;
  }
};

RainDrop.prototype.recalcVariables = function (changedVariable, variableValue) {
	switch (changedVariable) {
		case 'font-size':
			this.fontSize = variableValue;
			this.initializeVariables();
			break;

    case 'bg-color':
      this.BG_COLOR = variableValue;

		case 'default-color':
			this.DEFAULT_COLOR = '#' + variableValue;
			break;

		case 'rare-color':
			this.RARE_COLOR = '#' + variableValue;
			break;

		case 'rarity-rate':
			this.RARITY_RATE = variableValue;
			break;
	}
};


function MatrixRain(canvas) {
	this.canvas = canvas;
	this.width = this.canvas.dataset.width;
	this.height = this.canvas.dataset.height;
	this.localStorageRestoredData = {};

  //наличие нашего канваса в локал сторадже.
	if (localStorage.getItem(this.canvas.id)) {
		this.localStorageRestoredData = localStorage.getItem(this.canvas.id);
		this.localStorageRestoredData = JSON.parse(this.localStorageRestoredData);

    //переносим все ключи в датасет нашего канваса
		for (var key in this.localStorageRestoredData) {
			if (this.canvas.dataset[key]) {
				this.canvas.dataset[key] = this.localStorageRestoredData[key];
			}
		}
	}

	this.fontSize = this.canvas.dataset.fontSize;
	this.fallDirection = this.canvas.dataset.direction;
	this.STATIC_MULTIPLIER = this.canvas.dataset.multiplier;
	this.RAIN_SPEED = this.canvas.dataset.speed;
	this.VANISHING_SPEED = this.canvas.dataset.vanishingSpeed;
  this.BG_COLOR = this.canvas.dataset.bgColor;
	this.DEFAULT_COLOR = this.canvas.dataset.defaultColor;
	this.RARE_COLOR = this.canvas.dataset.rareColor;
	this.RARITY_RATE = this.canvas.dataset.rarityRate;
	this.localStorageData = this.localStorageRestoredData;
	this.localStorageData.id = this.canvas.id;

	this.arrayOfRainDrops = [];
	//это длина массива с каплями. всякий раз при изменении размера мы сравниваем с длиной, если стала меньше -- то кропаем массив
  //пока неактуально
	this.arrayOfRainDropsLength = '';

	this.alphabet = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐" +
		"田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐" +
		"田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐" +
		"畑ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてで" +
		"とどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみめもゃやゅゆょよらりるれろゎわゑ" +
		"をんゔゕゖ゚	゜ゝゞゟ" + "0123456789ABCDEFァアィイゥウェエォオカガキギクグケゲコゴ" +
		"サザシジスズセゼソゾタチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポ" +
		"マミムメモャヤュユョヨラリルレロヮワヱヲンヴヵヶヷヸヹヺ・ーヽヾヿ" + "123456789" +
		"0123456789012345678901234567890123456789012345678901234567890123456789012345" +
		"67890" + "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmn" +
		"opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKL" +
		"MNOPQRSTUVWXYZ".split('');

	this.initializeCanvas = this.initializeCanvas.bind(this);
	this.initializeVariables = this.initializeVariables.bind(this);
	this.drawRain = this.drawRain.bind(this);
	this.fillTheClouds = this.fillTheClouds.bind(this);
	this.init = this.init.bind(this);
	this.recalcVariables = this.recalcVariables.bind(this);
	this.setNumberOfRainDrops = this.setNumberOfRainDrops.bind(this);
	this.addSelectListener = this.addSelectListener.bind(this);
}

//первоначальная инициализациия _канваса_, не функции
//выполняется лишь раз
MatrixRain.prototype.initializeCanvas = function () {
	this.canvasField = this.canvas.getContext('2d');
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.columns = this.width / this.fontSize;
	this.rows = this.height / this.fontSize;

	this.canvasField.fillStyle = 'rgba(' + this.BG_COLOR +'1)';
};

//инициализация переменных, выполняется при изменении данных при вводе с формы
MatrixRain.prototype.initializeVariables = function () {
	this.columns = this.width / this.fontSize;
	this.rows = this.height / this.fontSize;

	this.setNumberOfRainDrops();

	//todo сделать после, вдруг разного вида буквы -- ето ок
	//меняем длину массива, чтобы не было букв разного размера
	//сравниваем с предыдущей длиной
	// if (this.arrayOfRainDropsLength < this.numberOfRainDrops) {
	// 	console.log(123);
	// 	this.arrayOfRainDrops.splice(this.arrayOfRainDropsLength);
	// }

	this.arrayOfRainDrops.length = 0;

	//заново заполняем массив, ибо если выбрать фонт сайз меньше, чем был -- то будут пустые места
	this.fillTheClouds();
};

//определяем количество "капель" в нашем канвасе, зависит от направления и мультиплаера
MatrixRain.prototype.setNumberOfRainDrops = function () {
	if (this.fallDirection === 'up' || this.fallDirection === 'down') {
		this.numberOfRainDrops = this.columns * this.STATIC_MULTIPLIER;
	} else {
		this.numberOfRainDrops = this.rows * this.STATIC_MULTIPLIER;
	}
};

//НАПОЛНЯЕМ облако каплями. каждую каплю инициализируем -- чтобы получила все переменные
//выполняется при запууске либо при изменении количества капель -- мультиплаер или фонт-сайз
MatrixRain.prototype.fillTheClouds = function () {
	//заполняем массив каплями, множитель нужен, чтобы не выглядело одиноко
	for (var i = 0; i < this.numberOfRainDrops; i++) {
		this.arrayOfRainDrops[i] = new RainDrop(this.canvasField, this.alphabet, this.fontSize, this.rows, this.columns, this.BG_COLOR, this.DEFAULT_COLOR, this.RARE_COLOR, this.RARITY_RATE);
    this.arrayOfRainDrops[i].initializeVariables();
	}

	//todo сделать после
	// //длина массива нужна для проверки при изменении количества капель
	// this.arrayOfRainDropsLength = this.numberOfRainDrops;
};

//дождик.
//циклим функцию отрисовки
//перезапускаем при изменении скорости
MatrixRain.prototype.drawRain = function (changedVariable) {

	this.dropTheAcid = function () {
		//каждую итерацию заливаем площадь черным, чтобы буквы скрывались
		//скорость исчезновения -- чем выше значение, тем быстрее закрашиваются буквы
		this.canvasField.fillStyle = "rgba(" + this.BG_COLOR + ", " + this.VANISHING_SPEED + ")";
		this.canvasField.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //перемещаем все капли в массиве
		for (var i = 0; i < this.arrayOfRainDrops.length; i++) {
			this.arrayOfRainDrops[i].fallFromTheSky(this.fallDirection);
		}
	};

	this.dropTheAcid = this.dropTheAcid.bind(this);

	if (!changedVariable) {
		this.intervalRaining = setInterval(this.dropTheAcid, this.RAIN_SPEED);
	}

  //надо обязательно стопить интервал, иначе множится
  if(changedVariable === 'speed') {
    clearInterval(this.intervalRaining);
    this.intervalRaining = setInterval(this.dropTheAcid, this.RAIN_SPEED);
  }
};

//изменение входных данных
//происходит при вводе с формы
//каждый раз записываем данные в локал сторадж
//если данные как-либо относятся к капле -- пересчитываем и у капли тоже
MatrixRain.prototype.recalcVariables = function (changedVariable, variableValue, localStorageProperty) {
	switch (changedVariable) {
		case 'font-size':
			this.fontSize = variableValue;
			this.initializeVariables();
			for (var i = 0; i < this.numberOfRainDrops; i++) {
				this.arrayOfRainDrops[i].recalcVariables(changedVariable, variableValue);
			}
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'direction':
			this.fallDirection = variableValue;
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'multiplier':
			this.STATIC_MULTIPLIER = variableValue;
			this.initializeVariables();
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'speed':
			this.RAIN_SPEED = variableValue;
			this.drawRain(changedVariable);
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'vanishing-speed':
			this.VANISHING_SPEED = variableValue;
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'bg-color':
      this.BG_COLOR = variableValue;
      this.localStorageData[localStorageProperty] = variableValue;
      localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'default-color':
			for (var j = 0; j < this.numberOfRainDrops; j++) {
				this.arrayOfRainDrops[j].recalcVariables(changedVariable, variableValue);
			}
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'rare-color':
			for (var k = 0; k < this.numberOfRainDrops; k++) {
				this.arrayOfRainDrops[k].recalcVariables(changedVariable, variableValue);
			}
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;

		case 'rarity-rate':
			for (var a = 0; a < this.numberOfRainDrops; a++) {
				this.arrayOfRainDrops[a].recalcVariables(changedVariable, variableValue);
			}
			this.localStorageData[localStorageProperty] = variableValue;
			localStorage.setItem(this.localStorageData.id, JSON.stringify(this.localStorageData));
			break;
	}
};

//селектим канвас при клике
//передаем все данные в форму
MatrixRain.prototype.addSelectListener = function () {
	var ourCanvas = this;

	this.canvas.addEventListener('click', function () {
		var activeCanvas = document.querySelector('.active');

		if (activeCanvas) {
			activeCanvas.classList.remove('active');
		}

		this.classList.add('active');

    //TODO КАК ЭТО МЕНЯТЬ? НУ СЕРЬЕЗНО, КАК ОБРАТИТЬСЯ К ФОРМЕ, ЧТОБЫ НЕ НАПРЯМУЮ К ПЕРЕМЕННОЙ?
		skyscraperForm.catchCanvasClick(ourCanvas);
	});
};

MatrixRain.prototype.init = function () {
	this.initializeCanvas();
	this.setNumberOfRainDrops();
	this.fillTheClouds();
	this.drawRain();
	this.addSelectListener();
};


function SkyscraperVariablesForm() {
	this.form = document.getElementById('skyscraper-form');

	this.fontSizeInput = this.form.querySelector('#var-font-size');
	this.directionInput = this.form.querySelector('#var-direction');
	this.multiplierInput = this.form.querySelector('#var-multiplier');
	this.speedInput = this.form.querySelector('#var-speed');
	this.vanishingSpeedInput = this.form.querySelector('#var-vanishing-speed');
	this.bgColorInput = this.form.querySelector('#var-bg-color');
	this.defaultColorInput = this.form.querySelector('#var-default-color');
	this.rareColorInput = this.form.querySelector('#var-rare-color');
	this.rarityRateInput = this.form.querySelector('#var-rarity-rate');

  this.fontSizeSpanValue = this.form.querySelector('.value-font-size');
  this.multiplierSpanValue = this.form.querySelector('.value-multiplier');
  this.speedSpanValue = this.form.querySelector('.value-speed');
  this.vanishingSpeedSpanValue = this.form.querySelector('.value-vanishing-speed');
  this.rarityRateSpanValue = this.form.querySelector('.value-rarity-rate');

  this.resetButton = this.form.querySelector('#reset-button');

	this.allSortOfListeners = this.allSortOfListeners.bind(this);
	this.catchCanvasClick = this.catchCanvasClick.bind(this);
	this.setValuesFromCanvas = this.setValuesFromCanvas.bind(this);
	this.init = this.init.bind(this);
}

//набрасываем листенеры на инпуты.
//параллельно меняем датасет у канваса и спан в форме, чтобы было видно цифровое значение
SkyscraperVariablesForm.prototype.allSortOfListeners = function () {
  //делаю из-за проблем с областью видимости, руки бы мне отрубить
	var activeCanvasBlock = this.activeCanvas;
  var fontSizeSpanValue = this.fontSizeSpanValue;
  var multiplierSpanValue = this.multiplierSpanValue;
  var speedSpanValue = this.speedSpanValue;
  var vanishingSpeedSpanValue = this.vanishingSpeedSpanValue;
  var rarityRateSpanValue = this.rarityRateSpanValue;

	//todo ЛИСТЕНЕРЫ НЕ СКИДЫВАЮТСЯ ЧТО ЗА ХУЙНЯ ИСПРАВИТЬ
	$(this.fontSizeInput).off('input');
	this.fontSizeFunction = function () {
		//ВОТ ЭТА ВОТ ХУЙНЯ ЧТО ЗА ПИЗДЕЦ
		console.log(123);
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
      fontSizeSpanValue.innerText = this.value;
		}
	};
	this.fontSizeInput.addEventListener('input', this.fontSizeFunction);


	$(this.directionInput).off();
	this.directionFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
		}
	};
	this.directionInput.addEventListener('change', this.directionFunction);

	$(this.multiplierInput).off();
	this.multiplierFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
      multiplierSpanValue.innerText = this.value;
		}
	};
	this.multiplierInput.addEventListener('input', this.multiplierFunction);

	$(this.speedInput).off();
	this.speedFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
      speedSpanValue.innerText = this.value;
		}
	};
	this.speedInput.addEventListener('input', this.speedFunction);

	$(this.vanishingSpeedInput).off();
	this.vanishingSpeedFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
      vanishingSpeedSpanValue.innerText = this.value;
		}
	};
	this.vanishingSpeedInput.addEventListener('input', this.vanishingSpeedFunction);

  $(this.bgColorInput).off();
  this.bgColorFunction = function () {
    if (activeCanvasBlock.canvas.classList.contains('active')) {
      activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
      activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
    }
  };
  this.bgColorInput.addEventListener('change', this.bgColorFunction);

	$(this.defaultColorInput).off();
	this.defaultColorFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
		}
	};
	this.defaultColorInput.addEventListener('change', this.defaultColorFunction);

	$(this.rareColorInput).off();
	this.rareColorFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
		}
	};
	this.rareColorInput.addEventListener('change', this.rareColorFunction);

	$(this.rarityRateInput).off();
	this.rarityRateFunction = function () {
		if (activeCanvasBlock.canvas.classList.contains('active')) {
			activeCanvasBlock.recalcVariables(this.dataset.parameter, this.value, this.dataset.property);
			activeCanvasBlock.canvas.dataset[this.dataset.property] = this.value;
      rarityRateSpanValue.innerText = this.value;
		}
	};
	this.rarityRateInput.addEventListener('input', this.rarityRateFunction);
};

//при клике с канваса, мы смотрим, какой канвас активный и у него, перебирая все дата-аттрибуты, берем их значения и подставляем в соответствующие инпуты
SkyscraperVariablesForm.prototype.setValuesFromCanvas = function () {
	var temporaryObject = this.activeCanvas.canvas.dataset;

	//перебираем все дата-аттрибуты в канвасе, если есть такие же в инпутах -- присваиваем им значение
	for (var key in temporaryObject) {
		var temporaryInput = this.form.querySelector('[data-property="' + key + '"]');
		if (temporaryInput) {
			temporaryInput.value = temporaryObject[key];
		}

    //также записываем все в спаны, числовое представление характеристик их рейндж инпутов
    var temporarySpanValue = this.form.querySelector('[data-span-value="' + key + '"]');
    if(temporarySpanValue) {
      temporarySpanValue.innerText = temporaryObject[key];
    }
	}
};

//слушаем канвас
SkyscraperVariablesForm.prototype.catchCanvasClick = function (canvasObject) {
	this.activeCanvas = canvasObject;
	this.setValuesFromCanvas();
	this.allSortOfListeners();
};

SkyscraperVariablesForm.prototype.init = function () {
	var form = this.form;

	//слушатель для показа формы
	window.addEventListener('keydown', function (event) {
		if (event.keyCode == 86) {
			if (form.classList.contains('hidden')) {
				form.classList.remove('hidden');
			} else {
				form.classList.add('hidden');
			}
		}
	});

  //слушатель для позиционирования формы
  var positionRadios = this.form.querySelectorAll('.form-position');
  [].forEach.call(positionRadios, function(radio) {
    radio.addEventListener('change', function() {
      if(form.classList.contains('left')) {
        form.classList.remove('left');
        form.classList.add('right');
      } else {
        form.classList.remove('right');
        form.classList.add('left');
      }
    });
  });

  //слушатель резета
  this.resetButton.addEventListener('click', function(event) {
    localStorage.clear();
  });
};

var skyscrapers = document.querySelectorAll('.skyscraper-canvas');

[].forEach.call(skyscrapers, function(skyscraper) {
  skyscraper = new MatrixRain(skyscraper);
  skyscraper.init();
});

var skyscraperForm = new SkyscraperVariablesForm;
skyscraperForm.init();















