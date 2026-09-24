// ==========================================
// CAMPUS MARKETPLACE - SCRIPT.JS
// ==========================================


// ==========================================
// LOAD ALL PRODUCTS
// ==========================================

async function loadProducts() {

    const productsContainer =
        document.getElementById("productsContainer");

    if (!productsContainer) {
        return;
    }

    try {

        const response =
            await fetch("/api/products");

        const products =
            await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Error loading products:", error);

        productsContainer.innerHTML =
            "<p>Failed to load products.</p>";
    }
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(products) {

    const productsContainer =
        document.getElementById("productsContainer");

    if (!productsContainer) {
        return;
    }

    productsContainer.innerHTML = "";

    if (products.length === 0) {

        productsContainer.innerHTML =
            "<p>No products available.</p>";

        return;
    }

    products.forEach(product => {

        const productCard =
            document.createElement("div");

        productCard.className =
            "product-card";

        productCard.innerHTML = `

            <div class="product-image-container">

                ${
                    product.image
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : `<div class="no-image">No Image</div>`
                }

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <p class="product-price">
                    ₹${product.price}
                </p>

                <p>
                    ${product.description}
                </p>

                <p>
                    <strong>Seller:</strong>
                    ${product.sellerName}
                </p>

                <button
                    class="view-product-button"
                    onclick="viewProduct('${product._id}')">
                    View Details
                </button>

            </div>
        `;

        productsContainer.appendChild(productCard);
    });
}


// ==========================================
// VIEW PRODUCT DETAILS
// ==========================================

function viewProduct(productId) {

    window.location.href =
        `product.html?id=${productId}`;
}


// ==========================================
// SEARCH PRODUCTS
// ==========================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        async function () {

            const searchText =
                this.value.toLowerCase().trim();

            try {

                const response =
                    await fetch("/api/products");

                const products =
                    await response.json();

                const filteredProducts =
                    products.filter(product =>

                        product.name
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        product.category
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        product.description
                            .toLowerCase()
                            .includes(searchText)
                    );

                displayProducts(filteredProducts);

            } catch (error) {

                console.error(
                    "Search error:",
                    error
                );
            }
        }
    );
}


// ==========================================
// CATEGORY FILTER
// ==========================================

const categoryFilter =
    document.getElementById("categoryFilter");

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        async function () {

            const selectedCategory =
                this.value;

            try {

                const response =
                    await fetch("/api/products");

                const products =
                    await response.json();

                if (selectedCategory === "") {

                    displayProducts(products);

                    return;
                }

                const filteredProducts =
                    products.filter(
                        product =>
                            product.category ===
                            selectedCategory
                    );

                displayProducts(filteredProducts);

            } catch (error) {

                console.error(
                    "Category filter error:",
                    error
                );
            }
        }
    );
}


// ==========================================
// LOAD PRODUCTS WHEN PAGE OPENS
// ==========================================

loadProducts();


// ==========================================
// IMAGE PREVIEW
// ==========================================

const imageInput =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

if (imageInput && imagePreview) {

    imageInput.addEventListener(
        "change",
        function () {

            const file = this.files[0];

            if (!file) {

                imagePreview.src = "";

                imagePreview.style.display =
                    "none";

                return;
            }

            // Maximum image size = 5 MB
            if (file.size > 5 * 1024 * 1024) {

                alert(
                    "Image size should be less than 5 MB."
                );

                this.value = "";

                imagePreview.src = "";

                imagePreview.style.display =
                    "none";

                return;
            }

            const reader =
                new FileReader();

            reader.onload = function (event) {

                imagePreview.src =
                    event.target.result;

                imagePreview.style.display =
                    "block";
            };

            reader.readAsDataURL(file);
        }
    );
}


// ==========================================
// SELL / ADD PRODUCT
// ==========================================

const sellForm =
    document.getElementById("sellForm");

if (sellForm) {

    sellForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const loggedInUser =
                JSON.parse(
                    localStorage.getItem(
                        "loggedInUser"
                    )
                );

            if (!loggedInUser) {

                alert(
                    "Please login before selling an item."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Your login session has expired. Please login again."
                );

                localStorage.removeItem(
                    "loggedInUser"
                );

                window.location.href =
                    "login.html";

                return;
            }


            const productName =
                document
                    .getElementById("productName")
                    .value
                    .trim();

            const category =
                document
                    .getElementById("category")
                    .value;

            const price =
                document
                    .getElementById("price")
                    .value;

            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();

            const sellerName =
                document
                    .getElementById("sellerName")
                    .value
                    .trim();

            const contact =
                document
                    .getElementById("contact")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            // ======================================
            // PHONE VALIDATION
            // ======================================

            if (!/^\d{10}$/.test(contact)) {

                alert(
                    "Please enter a valid 10-digit phone number."
                );

                return;
            }


            // ======================================
            // EMAIL VALIDATION
            // ======================================

            if (!email) {

                alert(
                    "Please enter your email address."
                );

                return;
            }


            // ======================================
            // CREATE PRODUCT
            // ======================================

            const product = {

                name: productName,

                category: category,

                price: price,

                description: description,

                sellerName: sellerName,

                contact: contact,

                email: email,

                sellerId: loggedInUser.id,

                image:
                    imagePreview &&
                    imagePreview.src
                        ? imagePreview.src
                        : ""
            };


            try {

                const response =
                    await fetch(
                        "/api/products",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(product)
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(
                        "Product posted successfully!"
                    );

                    sellForm.reset();

                    if (imagePreview) {

                        imagePreview.src = "";

                        imagePreview.style.display =
                            "none";
                    }

                    window.location.href =
                        "index.html";

                } else {

                    alert(
                        data.message ||
                        "Failed to post product."
                    );
                }

            } catch (error) {

                console.error(
                    "Error posting product:",
                    error
                );

                alert(
                    "Something went wrong while posting the product."
                );
            }
        }
    );
}


// ==========================================
// USER REGISTRATION
// ==========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const message =
                document.getElementById(
                    "registerMessage"
                );


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.style.color =
                    "red";

                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "green";

                    registerForm.reset();


                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1500
                    );

                } else {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "red";
                }

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                message.textContent =
                    "Something went wrong. Please try again.";

                message.style.color =
                    "red";
            }
        }
    );
}


// ==========================================
// USER LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                const response =
                    await fetch(
                        "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "green";


                    // Save logged-in user
                    localStorage.setItem(
                        "loggedInUser",
                        JSON.stringify(
                            data.user
                        )
                    );


                    // Save JWT authentication token
                    localStorage.setItem(
                        "token",
                        data.token
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "index.html";

                        },
                        1000
                    );

                } else {

                    message.textContent =
                        data.message;

                    message.style.color =
                        "red";
                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                message.textContent =
                    "Something went wrong. Please try again.";

                message.style.color =
                    "red";
            }
        }
    );
}


// ==========================================
// NAVBAR LOGIN / LOGOUT
// ==========================================

function updateNavbar() {

    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    const loginButton =
        document.getElementById(
            "navLoginButton"
        );

    const registerButton =
        document.getElementById(
            "navRegisterButton"
        );

    const userMenu =
        document.getElementById(
            "userMenu"
        );

    const userName =
        document.getElementById(
            "userName"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (
        !loginButton ||
        !registerButton ||
        !userMenu
    ) {

        return;
    }


    if (loggedInUser) {

        const user =
            JSON.parse(
                loggedInUser
            );


        loginButton.style.display =
            "none";

        registerButton.style.display =
            "none";


        userMenu.style.display =
            "flex";


        userName.textContent =
            "Hi, " + user.name;


        if (logoutButton) {

            logoutButton.onclick =
                function () {

                    // Remove user information
                    localStorage.removeItem(
                        "loggedInUser"
                    );

                    // Remove JWT token
                    localStorage.removeItem(
                        "token"
                    );

                    window.location.reload();
                };
        }

    } else {

        loginButton.style.display =
            "inline-block";

        registerButton.style.display =
            "inline-block";

        userMenu.style.display =
            "none";
    }
}


updateNavbar();


// ==========================================
// MY LISTINGS
// ==========================================

const myListingsContainer =
    document.getElementById(
        "myListingsContainer"
    );

const noListingsMessage =
    document.getElementById(
        "noListingsMessage"
    );


if (myListingsContainer) {

    const loggedInUser =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );


    if (!loggedInUser) {

        alert(
            "Please login to view your listings."
        );

        window.location.href =
            "login.html";

    } else {

        loadMyListings(
            loggedInUser.id
        );
    }
}


// ==========================================
// LOAD MY LISTINGS
// ==========================================

async function loadMyListings(userId) {

    try {

        const response =
            await fetch(
                "/api/products"
            );


        const products =
            await response.json();


        const myProducts =
            products.filter(
                product =>
                    product.sellerId === userId
            );


        if (myProducts.length === 0) {

            if (noListingsMessage) {

                noListingsMessage.style.display =
                    "block";
            }

            return;
        }


        myProducts.forEach(
            product => {

                const productCard =
                    document.createElement(
                        "div"
                    );


                productCard.className =
                    "product-card";


                productCard.innerHTML = `

                    <div class="product-image-container">

                        ${
                            product.image

                            ? `
                                <img
                                    src="${product.image}"
                                    alt="${product.name}"
                                >
                              `

                            : `
                                <div class="no-image">
                                    No Image
                                </div>
                              `
                        }

                    </div>


                    <div class="product-info">

                        <span class="product-category">
                            ${product.category}
                        </span>


                        <h3>
                            ${product.name}
                        </h3>


                        <p class="product-price">
                            ₹${product.price}
                        </p>


                        <p>
                            ${product.description}
                        </p>


                        <p>
                            <strong>Seller:</strong>
                            ${product.sellerName}
                        </p>


                        <div class="listing-actions">

                            <button
                                class="edit-button"
                                onclick="editListing('${product._id}')"
                            >
                                ✏️ Edit
                            </button>

                            <button
                                class="delete-button"
                                onclick="deleteListing('${product._id}')"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>
                `;


                myListingsContainer.appendChild(
                    productCard
                );
            }
        );

    } catch (error) {

        console.error(
            "Error loading my listings:",
            error
        );


        myListingsContainer.innerHTML =
            "<p>Failed to load your listings.</p>";
    }
}


// ==========================================
// DELETE LISTING
// ==========================================

async function deleteListing(productId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this listing?"
        );


    if (!confirmDelete) {

        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Please login again."
        );

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `/api/products/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message
            );


            window.location.reload();

        } else {

            alert(
                data.message
            );
        }

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Something went wrong while deleting the listing."
        );
    }
}

function editListing(productId) {
    window.location.href = `edit-listing.html?id=${productId}`;
}

// ==========================================
// PROTECT SELL PAGE
// ==========================================

if (
    window.location.pathname.endsWith(
        "sell.html"
    )
) {

    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!loggedInUser) {

        alert(
            "Please login before selling an item."
        );

        window.location.href =
            "login.html";
    }
}


// ==========================================
// EDIT LISTING
// ==========================================

const editProductForm =
    document.getElementById(
        "editProductForm"
    );

if (editProductForm) {

    const loggedInUser =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );


    if (!loggedInUser) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

    } else {

        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const productId =
            urlParams.get("id");


        if (!productId) {

            alert(
                "Product not found."
            );

            window.location.href =
                "my-listings.html";

        } else {

            loadProductForEditing(
                productId
            );
        }


        // ======================================
        // IMAGE PREVIEW
        // ======================================

        const editImage =
            document.getElementById(
                "editImage"
            );

        const editImagePreview =
            document.getElementById(
                "editImagePreview"
            );


        if (editImage) {

            editImage.addEventListener(
                "change",
                function () {

                    const file =
                        this.files[0];


                    if (!file) {
                        return;
                    }


                    if (
                        file.size >
                        5 * 1024 * 1024
                    ) {

                        alert(
                            "Image size should be less than 5 MB."
                        );

                        this.value = "";

                        return;
                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function (event) {

                            editImagePreview.src =
                                event.target.result;

                            editImagePreview.style.display =
                                "block";
                        };


                    reader.readAsDataURL(file);
                }
            );
        }


        // ======================================
        // SAVE EDITED PRODUCT
        // ======================================

        editProductForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    alert(
                        "Please login again."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                const name =
                    document
                        .getElementById(
                            "editProductName"
                        )
                        .value
                        .trim();


                const category =
                    document
                        .getElementById(
                            "editCategory"
                        )
                        .value;


                const price =
                    document
                        .getElementById(
                            "editPrice"
                        )
                        .value;


                const description =
                    document
                        .getElementById(
                            "editDescription"
                        )
                        .value
                        .trim();


                const sellerName =
                    document
                        .getElementById(
                            "editSellerName"
                        )
                        .value
                        .trim();


                const contact =
                    document
                        .getElementById(
                            "editContact"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "editEmail"
                        )
                        .value
                        .trim();


                if (!/^\d{10}$/.test(contact)) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    return;
                }


                let image =
                    editImagePreview.src;


                if (
                    !image ||
                    image ===
                    window.location.href
                ) {

                    image = "";
                }


                const updatedProduct = {

                    name: name,

                    category: category,

                    price: price,

                    description: description,

                    sellerName: sellerName,

                    contact: contact,

                    email: email,

                    sellerId:
                        loggedInUser.id,

                    image: image
                };


                try {

                    const response =
                        await fetch(
                            `/api/products/${productId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify(
                                        updatedProduct
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        alert(
                            "Listing updated successfully!"
                        );


                        window.location.href =
                            "my-listings.html";

                    } else {

                        alert(
                            data.message ||
                            "Failed to update listing."
                        );
                    }

                } catch (error) {

                    console.error(
                        "Update error:",
                        error
                    );


                    alert(
                        "Something went wrong while updating the listing."
                    );
                }

            }
        );
    }
}


// ==========================================
// LOAD PRODUCT FOR EDITING
// ==========================================

async function loadProductForEditing(
    productId
) {

    try {

        const response =
            await fetch(
                "/api/products"
            );


        const products =
            await response.json();


        const product =
            products.find(
                item =>
                    item._id === productId
            );


        if (!product) {

            alert(
                "Product not found."
            );

            window.location.href =
                "my-listings.html";

            return;
        }


        const loggedInUser =
            JSON.parse(
                localStorage.getItem(
                    "loggedInUser"
                )
            );


        if (
            !loggedInUser ||
            product.sellerId !==
                loggedInUser.id
        ) {

            alert(
                "You can only edit your own listings."
            );

            window.location.href =
                "my-listings.html";

            return;
        }


        document.getElementById(
            "editProductName"
        ).value =
            product.name;


        document.getElementById(
            "editCategory"
        ).value =
            product.category;


        document.getElementById(
            "editPrice"
        ).value =
            product.price;


        document.getElementById(
            "editDescription"
        ).value =
            product.description;


        document.getElementById(
            "editSellerName"
        ).value =
            product.sellerName;


        document.getElementById(
            "editContact"
        ).value =
            product.contact;


        document.getElementById(
            "editEmail"
        ).value =
            product.email;


        if (product.image) {

            const preview =
                document.getElementById(
                    "editImagePreview"
                );


            preview.src =
                product.image;


            preview.style.display =
                "block";
        }


    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );


        alert(
            "Failed to load product."
        );
    }
}

// ==========================================
// PRODUCT DETAILS PAGE
// ==========================================

const productDetails =
    document.getElementById("productDetails");

if (productDetails) {

    loadProductDetails();
}


// ==========================================
// LOAD SINGLE PRODUCT DETAILS
// ==========================================

async function loadProductDetails() {

    try {

        // Get product ID from URL
        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const productId =
            urlParams.get("id");


        // Check if ID exists
        if (!productId) {

            productDetails.innerHTML =
                "<p>Product not found.</p>";

            return;
        }


        // Get all products
        const response =
            await fetch("/api/products");


        const products =
            await response.json();


        // Find selected product
        const product =
            products.find(
                item =>
                    item._id === productId
            );


        // Product doesn't exist
        if (!product) {

            productDetails.innerHTML =
                "<p>Product not found.</p>";

            return;
        }


        // Display product
        productDetails.innerHTML = `

            <div class="product-details-card">

                <div class="product-details-image">

                    ${
                        product.image

                        ? `
                            <img
                                src="${product.image}"
                                alt="${product.name}"
                            >
                          `

                        : `
                            <div class="no-image">
                                No Image Available
                            </div>
                          `
                    }

                </div>


                <div class="product-details-info">

                    <span class="product-category">
                        ${product.category}
                    </span>


                    <h1>
                        ${product.name}
                    </h1>


                    <h2 class="product-price">
                        ₹${product.price}
                    </h2>


                    <p>
                        <strong>Description</strong>
                    </p>

                    <p>
                        ${product.description}
                    </p>


                    <hr>


                    <p>
                        <strong>Seller:</strong>
                        ${product.sellerName}
                    </p>


                    <p>
                        <strong>Contact:</strong>
                        ${product.contact}
                    </p>


                    <p>
                        <strong>Email:</strong>
                        ${product.email}
                    </p>


                    <br>


                    <a
                        href="index.html"
                        class="register-button"
                    >
                        ← Back to Products
                    </a>

                </div>

            </div>
        `;

    } catch (error) {

        console.error(
            "Error loading product details:",
            error
        );

        productDetails.innerHTML =
            "<p>Failed to load product details.</p>";
    }
}

// ==========================================
// SEARCH BUTTON
// ==========================================

function searchProducts() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    fetch("/api/products")
        .then(response => response.json())
        .then(products => {

            const filteredProducts =
                products.filter(product =>

                    product.name
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    product.category
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    product.description
                        .toLowerCase()
                        .includes(searchText)
                );

            displayProducts(filteredProducts);

            // Scroll to products
            const productsSection =
                document.getElementById("products");

            if (productsSection) {
                productsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }

        })
        .catch(error => {

            console.error(
                "Search error:",
                error
            );

        });
}

// ==========================================
// CATEGORY CLICK FILTER
// ==========================================

async function filterByCategory(category) {

    try {

        const response =
            await fetch("/api/products");

        const products =
            await response.json();


        let filteredProducts;


        if (category === "Others") {

            const mainCategories = [
                "Books",
                "Electronics",
                "Clothes",
                "Furniture",
                "Mobile Phones",
                "Hostel Essentials",
                "Sports"
            ];

            filteredProducts =
                products.filter(product =>
                    !mainCategories.includes(
                        product.category
                    )
                );

        } else {

            filteredProducts =
                products.filter(product =>
                    product.category
                        .toLowerCase()
                        .includes(category.toLowerCase())
                );

        }


        displayProducts(filteredProducts);


        // Scroll to products section

        const productsSection =
            document.getElementById("products");

        if (productsSection) {

            productsSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    } catch (error) {

        console.error(
            "Category filter error:",
            error
        );

    }   

}