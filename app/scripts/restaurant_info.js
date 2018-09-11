import RestaurantHelper from '../services/restaurantHelper';
import FavoriteHelper from '../services/favoriteHelper';
import ReviewHelper from '../services/reviewHelper';

window['restaurant'];
window['reviews'];
window['map'];

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      RestaurantHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    RestaurantHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const favorite = document.getElementById('favorite')
  favorite.setAttribute('data-id', `${restaurant.id}`);
  // setting the btn color
  if (restaurant.is_favorite == "true") {
    favorite.innerHTML = '❤'
    favorite.setAttribute('aria-label', `${restaurant.name} is a favorite`)
  }
  else {
    favorite.innerHTML = '♡';
    favorite.setAttribute('aria-label', `set ${restaurant.name} as a favorite`)
  }

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = RestaurantHelper.imageUrlForRestaurant(restaurant, 'src');
  image.alt = `${restaurant.name} Restauraunt`


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill review html. fetch/add reviews to db. pull reviews from db
  ReviewHelper.fetchReviewsByRestaurantId(restaurant.id, (error, reviews) => {
    if (error) {
      console.log(`ERROR: ${error}`)
      fillReviewsHTML()
      return
    } else {
      fillReviewsHTML(reviews)
    }
  })
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = ( reviews = self.restaurant.reviews ) => {
  // console.log(reviews)
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  const reviewSubmission = document.createElement('button')
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  reviewSubmission.setAttribute('id', 'submit-review')
  reviewSubmission.setAttribute('aria-label', 'submit a review for this restaurant')
  reviewSubmission.innerHTML = 'Submit a Review'
  container.appendChild(reviewSubmission)

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });

  container.appendChild(ul);

  // add review submission html
  addReviewSubmission()
  cacheNewReview()
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  // review body
  const li = document.createElement('li');
  const header = document.createElement('header');
  const article = document.createElement('article');

  // review body inner components
  const name = document.createElement('p');
  const date = document.createElement('p');
  const rating = document.createElement('p');
  const comments = document.createElement('p');

  // date parsed for display
  const reviewDate = new Date(review.updatedAt).toUTCString().substr(4, 12);

  li.setAttribute('role','listitem')
  li.setAttribute('tabindex','0')
  li.appendChild(header);
  li.appendChild(article);

  name.classList.add('review-name');
  name.innerHTML = review.name;
  name.setAttribute('aria-label', `reviewed by ${review.name} on ${reviewDate}`)
  header.appendChild(name);

  date.classList.add('review-date');
  date.innerHTML = `${reviewDate}`
  header.appendChild(date);

  rating.classList.add('review-rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('aria-label', `Rating: ${review.rating}`);
  rating.setAttribute('tabindex', '0');
  article.appendChild(rating);

  comments.classList.add('review-comments');
  comments.setAttribute('tabindex', '0');
  comments.innerHTML = review.comments;
  article.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  breadcrumb.appendChild(li);
  li.appendChild(a);
  a.setAttribute('aria-current', 'page')
  a.innerHTML = restaurant.name;
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// adds/removes the restaurant from the favorite database.
// updates the restaurant database.
// updates the html
function addRemoveFavorite(e) {
  if ( e.target.classList.contains('favorite-btn') ) {
    // fetch the restaurant from the restaurants db || from the network, by id
    RestaurantHelper.fetchRestaurantById(e.target.dataset.id, (error, restaurant) => {
      typeof(restaurant)
      // if the restaurant favorite status is true
      if ( restaurant.is_favorite == "true") {
        // pull restaurant from favorite endpoint
        FavoriteHelper.pullFavoriteRestaurant(e.target.dataset.id)
        // change restaurant is_favorite status to false
        restaurant.is_favorite = "false"
        RestaurantHelper.updateRestaurantData(restaurant);
        // remove restaurant from the favorite db
        FavoriteHelper.removeFavoriteRestaurantDB(e.target.dataset.id, (error, restaurant) => {
          if (error) { console.log(error) }
        })

        // change the inner html of the target button to the outline heart
        e.target.innerHTML = '♡';
        e.target.setAttribute('aria-label', `set ${restaurant.name} as a favorite`)

      } else {
        // push restaurant to favorite endpoint
        FavoriteHelper.pushFavoriteRestaurant(e.target.dataset.id)
        // change the is_favorite property for the restaurant db to true
        restaurant.is_favorite = "true"
        RestaurantHelper.updateRestaurantData(restaurant);
        // add restaurant to the favorite db
        FavoriteHelper.addFavoriteRestaurantDB(restaurant)
        // update the target button's html to the filled heart
        e.target.innerHTML = '❤';
        e.target.setAttribute('aria-label', `${restaurant.name} is a favorite`)
      }
    })
  }
} // end addRemoveFavorite()

// get the information for a new review and cache that review for later
const cacheNewReview = () => {

// submit btn
const reviewSubmit = document.getElementById('reviewSubmit');

  // put together new review into an obj to fetch
  const buildNewReview = (e) => {

    // grab values of user input
    const reviewName = document.getElementById('reviewName').value;
    const reviewRating = document.getElementById('reviewRating').value;
    const reviewComments = document.getElementById('reviewComments').value;

    // new review obj
    let review = {};

    // add values
    review.restaurant_id = self.restaurant.id;
    review.name = reviewName;
    review.rating = reviewRating;
    review.comments = reviewComments;

    // post request
    fetch(ReviewHelper.REVIEWS_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      redirect: 'follow',
      mode: 'cors',
      body: JSON.stringify(review),
    }).then( response => {
      return response.json()
    }).catch( error => {
      return `ERROR ${error}`;
    }).then( newReview => {
      console.log(newReview)
      ReviewHelper.addReview(newReview)
    })


    e.preventDefault();
  }

  reviewSubmit.addEventListener('click', buildNewReview)
}

// add show/hide review form
const addReviewSubmission = () => {
  // review submission modal
  const reviewBtn = document.getElementById('submit-review')
  const close = document.querySelector('#modalClose')

  // open Modal fn
  const openModal = (e) => {
    const modal = document.querySelector('.modal')
    modal.style.display = 'block';
    e.preventDefault()
  }

  // close modal fn
  const closeModal = (e) => {
    const modal = document.querySelector('.modal')
    modal.style.display = 'none';
    e.preventDefault()
  }

  // event listeners
  reviewBtn.addEventListener('click', openModal)
  close.addEventListener('click', closeModal)
}



document.addEventListener('click', addRemoveFavorite)
