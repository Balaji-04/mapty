// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const cadence_label = document.querySelector('.cad');
const elevation_label = document.querySelector('.elev');
//const map_label = document.getElementById('map');

//  if (module.hot) {
//      module.hot.accept()
//  }

//getUserLocation();
class Workout{
    constructor(distance, duration, coords){
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
        this.date = new Date();
        this.id = (Date.now() + '').slice(-10);
    }
    
}
class cycling extends Workout{
    constructor(distance, duration, coords, elevation){
        super(distance, duration, coords);
        this.elevation = elevation;
        this.name = 'cycling';
        this.calculateSpeed();
    }
    calculateSpeed(){
        this.speed = this.distance / this.duration;
    }
    toString(){
        this.description = `Cycling on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
        return this.description;
    }
}
class running extends Workout{
    constructor(distance, duration, coords, cadence){
        super(distance, duration, coords);
        this.cadence = cadence;
        this.name = 'running';
        this.calculatePace();
    }
    calculatePace(){
        this.pace = this.duration / this.distance;
    }
    toString(){
        this.description =  `Running on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
        return this.description;
    }
}
class App{
    #workouts = [];
    constructor(){
        this._getUserLocation();

        
        
        
        form.addEventListener('submit', (event)=>{
            event.preventDefault(); // stop the reloading of the page

            
            //checking if valid
            this._newWorkout();

            this._hideForm();
            
        });
        
        inputType.addEventListener('change', () => {
            this._toggleInputField();
        });

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }
    _hideForm(){
        form.classList.toggle('hidden'); // changing back the form to hidden
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';    
    }
    _getUserLocation(){
        navigator.geolocation?.getCurrentPosition((position) =>{
            const {latitude,longitude} = position.coords;
            this._renderMap(latitude, longitude);
        }, this._locRetrivalFailed, {enableHighAccuracy: true});
    }
    _locRetrivalFailed(){
        alert("Kindly allow location permissions!");
    }
    _renderMap(lat,lng){
        //console.log('called');
        this.coords = [lat,lng];
        this.map = L.map('map').setView(this.coords, 13);
    
         L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             }).addTo(this.map);
        
         this.map.on('click', (event) => {
            //console.log(event);
            this.mapEvent = event;
            this.ncoords = [this.mapEvent.latlng.lat, this.mapEvent.latlng.lng];
            inputDistance.focus();
            this._renderForm();
            
         });
         this._getLocalStorage();
    }
    _renderForm(){
        form.classList.remove('hidden');
    }
    _toggleInputField(){
        cadence_label.classList.toggle('form__row--hidden');
        elevation_label.classList.toggle('form__row--hidden');
        inputDistance.focus();
    }
    _addPopup(content, clsName){
        const custom_popup = L.popup({
            maxWidth: 230,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: clsName
        });

        L.marker(this.ncoords).addTo(this.map)
            .bindPopup(custom_popup)
            .setPopupContent(`${content}`)
            .openPopup();
    }
    _newWorkout(){
        let workout;
        if (inputType.value === 'running'){
            if (inputDistance.value > 0 && inputDuration.value > 0 && inputCadence.value > 0)
                workout = new running(inputDistance.value, inputDuration.value, this.ncoords, inputCadence.value);
            else{
                return alert('Inputs have to be positive numbers!');
            }
        }
        if (inputType.value === 'cycling'){
            if (inputDistance.value > 0 && inputDuration.value > 0 && inputElevation.value > 0)
                workout = new cycling(inputDistance.value, inputDuration.value, this.ncoords, inputElevation.value);
            else{
                return alert('Inputs have to be positive numbers!');
            }
        }
        
        
        this._addPopup( workout.toString(),`${inputType.value}-popup`);
        //push to workouts array and render that in HTML, store that in local storage.
        this.#workouts.push(workout);
        this._setLocalStorage();
        this._renderWorkoutHTML(workout);
    }
    _renderWorkoutHTML(workout){
        let html = `<li class="workout workout--${workout.name}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${(workout.name === 'cycling')?'🚴‍♀️':'🏃‍♂️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
          if (workout.name === 'running'){
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
          }else if(workout.name === 'cycling'){
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
          }
          form.insertAdjacentHTML('afterend', html);
    }
    _moveToPopup(event){
        const topop = event.target.closest('.workout');
        if (!topop) return;
        const workout = this.#workouts.find( (ele) => ele.id === topop.dataset.id);
        //console.log(workout);
        this.map.setView(workout.coords, 13, {
            animate: true,
        });
    }
    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }
    _getLocalStorage(){
        let data = JSON.parse(localStorage.getItem('workouts'));
        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach((ele) => {
            this._renderWorkoutHTML(ele);
            //this._addPopup()
            const custom_popup = L.popup({
                maxWidth: 230,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${ele.name}-popup`
            });
    
            L.marker(ele.coords).addTo(this.map)
                .bindPopup(custom_popup)
                .setPopupContent(`${ele.description}`)
                .openPopup();
        });
    }
    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }
}
let app = new App();
// let woek = new Workout(12, 12, 12);
// console.log(woek.id);
// let worrk = new Workout(12, 12, 12);
// console.log(woek.id);