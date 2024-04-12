import { useState, useEffect } from 'react';
import { 
    Outlet, 
    NavLink,
    useLoaderData,
    Form,
    redirect,
    useNavigation,
    useSubmit,
 } from "react-router-dom";
import { getContacts, createContact } from "../contacts";

export async function action() {
    const contact = await createContact();
    return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return { contacts, q };
}

export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();
    const [toggleFav, setToggleFav] = useState(false);

    const searching =
      navigation.location &&
      new URLSearchParams(navigation.location.search).has(
        "q"
      );

    useEffect(() => {
      document.getElementById("q").value = q;
    }, [q]);

    //New function to render favorite contacts on navbar
    const displayFav = () => {
      setToggleFav(toggleFav => !toggleFav);
    };

    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          {/* Implemented button to show only favorites on the sidebar */}
          <div id="fav-button-container">
            <button onClick={displayFav}>Toggle Favorites</button>
          </div>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                className={searching ? "loading" : ""}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q}
                onChange={(event) => {
                  const isFirstSearch = q == null;
                  submit(event.currentTarget.form, {
                    replace: !isFirstSearch,
                  });
                }}
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={!searching}
              />
              <div
                className="sr-only"
                aria-live="polite"
              ></div>
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {!toggleFav && contacts.length ? (
                <ul>
                {contacts.map((contact) => (
                    <li key={contact.id}>
                        <NavLink 
                          to={`contacts/${contact.id}`}
                          className={({ isActive, isPending }) =>
                            isActive
                              ? "active"
                              : isPending
                              ? "pending"
                              : ""
                          }
                        >
                            {contact.first || contact.last ? (
                                <>
                                    {contact.first} {contact.last}
                                </>
                            ) : (
                                <i>No Name</i>
                            )
                        }{" "}
                        {contact.favorite && <span>★</span>}
                        </NavLink>
                    </li>
                ))}
            </ul> 
            ) : toggleFav && contacts.length ? ( // branch to filter favorite contacts
              <ul>
                {contacts.filter((contact) => {
                  return contact.favorite === true;
                }).map((contact) => (
                    <li key={contact.id}>
                        <NavLink 
                          to={`contacts/${contact.id}`}
                          className={({ isActive, isPending }) =>
                            isActive
                              ? "active"
                              : isPending
                              ? "pending"
                              : ""
                          }
                        >
                            {contact.first || contact.last ? (
                                <>
                                    {contact.first} {contact.last}
                                </>
                            ) : (
                                <i>No Name</i>
                            )
                        }{" "}
                        {contact.favorite && <span>★</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>
            ) : (
                <p>
                    <i>No contact</i>
                </p>
            )}
          </nav>
        </div>
        <div 
          id="detail"
          className={
            navigation.state === "loading" ? "loading" : ""
          }
        >
            <Outlet />
        </div>
      </>
    );
  }