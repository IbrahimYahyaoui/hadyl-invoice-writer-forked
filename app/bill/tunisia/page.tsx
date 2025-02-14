"use client";
import React, { useEffect, useState } from "react";
import "../../page.css";

import {
  Button,
  ButtonGroup,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import addIcon from "../../assets/icons/add.svg";
import printIcon from "../../assets/icons/print.svg";
import Image from "next/image";
import stamp from "../../assets/stamp.png";
import phone from "../../assets/icons/phone.svg";
import locationIcon from "../../assets/icons/location.svg";
import QRCode from "react-qr-code";

const index = () => {
  const [mode, setMode] = useState<"BILL" | "BLANC">("BILL");
  //
  const [name, setName] = useState<string>("");
  const [uid, setUid] = useState<string>("");

  // Blanc state
  const [titleText, setTitleText] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>("");
  const [headText, setHeadText] = useState<string>("");
  const [isPrintDisabled, setIsPrintDisabled] = useState<boolean>(true);
  const [dateValue, setDateValue] = useState<string>("");
  useEffect(() => {
    if (!window.location.hash) {
      //@ts-ignore
      window.location = window.location + "#loaded";
      window.location.reload();
    }
  }, []);
  useEffect(() => {
    document.title = `Invoice ${uid}`;
  }, [uid]);

  // bill state
  const [currency, setCurrency] = useState<Intl.NumberFormat>(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    })
  );
  const currencies = [
    { value: "EUR", label: "€ - Euro" },
    { value: "USD", label: "$ - US Dollar" },
    { value: "GBP", label: "£ - UK Pound" },
    { value: "TND", label: "TND - Tunisian Dinar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
  ];

  const changeCurrency = (currencyCode: string) => {
    setCurrency(
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currencyCode,
      })
    );
  };
  const [accountBank, setAccountBank] = useState<string>("Attijari BANK");
  const [accountName, setAccountName] = useState<string>("Ste HADYL Consult");
  const [accountNb, setAccountNb] = useState<string>("04034120004048782978");
  const [accountSwift, setAccountSwift] = useState<string>("BSTUTNTT");
  const [Tht, setTht] = useState<string>("");
  const [Ttc, setTtc] = useState<string>("");
  // use TVA as discount for Tn just change + to - in the formula
  const [Tva, setTva] = useState<string>("");
  const [items, setItems] = useState<
    {
      qty: string;
      desc: string;
      unit: string;
      price: string;
      total: any;
    }[]
  >([
    {
      qty: "",
      desc: "",
      unit: "",
      price: "",
      total: "",
    },
  ]);

  const calculateItemTotal = (qty: string, price: string) => {
    const quantity = parseFloat(qty);
    const unitPrice = parseFloat(price);

    const subtotal = quantity * unitPrice;

    const total = subtotal;

    return total.toFixed(2);
  };

  useEffect(() => {
    const calculatedTotal = items
      .reduce((acc, item) => {
        // Remove non-numeric characters and currency signs from price and total
        const cleanPrice =
          parseFloat(item.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        const cleanTotal =
          parseFloat(item.total.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

        // Add cleanTotal to the accumulator
        return acc + cleanTotal;
      }, 0)
      .toFixed(2);

    if (calculatedTotal !== "0.00") {
      setTht(calculatedTotal);

      setTtc(
        currency.format(
          parseFloat(
            (
              parseFloat(calculatedTotal) -
              (parseFloat(calculatedTotal) * parseFloat(Tva) || 0) / 100
            ).toFixed(2)
          )
        )
      );
    } else {
      setTht("");
      setTtc("");
    }
  }, [items, Tva]);

  const handlePrint = () => {
    // Format the prices and totals
    const formattedItems = items.map((item) => {
      return {
        ...item,
        price: currency.format(parseFloat(item.price)),
        total: currency.format(parseFloat(item.total)),
      };
    });

    // Set the formatted values
    setItems(formattedItems);

    // Print the page
    setTimeout(() => {
      window.print();

      // Delay resetting the state to ensure the print dialog has opened
      setTimeout(() => {
        setItems(
          items.map((item) => ({
            ...item,
            price: item.price ? parseFloat(item.price).toFixed(2) : "",
            total: item.total ? parseFloat(item.total).toFixed(2) : "",
          }))
        );
        setTht("");
        setTtc("");
        setTva("");
      }, 100);
    }, 100);
  };

  useEffect(() => {
    if (mode === "BLANC") {
      setIsPrintDisabled(false);
      return;
    }
    // Check if name or uid is empty
    if (!name || !uid) {
      setIsPrintDisabled(true);
      return;
    }

    // Check if any item fields are empty
    const allItemsValid = items.every(
      (item) => item.qty && item.price && item.total && item.total !== "NaN"
    );

    setIsPrintDisabled(!allItemsValid);
  }, [items, name, uid, mode]);

  return (
    <div className="pagesBg billPageWrapper">
      {/* control */}
      <ButtonGroup
        className="billSwitch"
        sx={{
          position: "fixed",
          left: "20px",
          top: "20px",
          backgroundColor: "white",
          ml: 1,
          zIndex: 100,
        }}
        disableElevation
        variant="contained"
        aria-label="Mode button group"
      >
        <Button
          onClick={() => {
            setMode("BLANC");
          }}
          sx={{
            backgroundColor: mode === "BLANC" ? "#1477cc" : "black",
            color: "white",
            opacity: mode === "BLANC" ? 1 : 0.5,
          }}
        >
          BLANC
        </Button>
        <Button
          onClick={() => {
            setMode("BILL");
          }}
          sx={{
            backgroundColor: mode === "BILL" ? "#1477cc" : "black",
            color: "white",
            opacity: mode === "BILL" ? 1 : 0.5,
          }}
        >
          Invoice
        </Button>
      </ButtonGroup>

      {mode === "BILL" ? (
        <ButtonGroup
          className="currencySelect"
          sx={{
            position: "fixed",
            right: "20px",
            top: "20px",
            backgroundColor: "white",
            zIndex: 100,
          }}
          disableElevation
          variant="contained"
          orientation="vertical"
          aria-label="currency button group"
        >
          {currencies.map((cur) => (
            <Button
              key={cur.value}
              onClick={() => changeCurrency(cur.value)}
              sx={{
                backgroundColor:
                  currency.resolvedOptions().currency === cur.value
                    ? "#1477cc"
                    : "black",

                color:
                  currency.resolvedOptions().currency === cur.value
                    ? "white"
                    : "white",
                opacity:
                  currency.resolvedOptions().currency === cur.value ? 1 : 0.5,
              }}
            >
              {cur.label}
            </Button>
          ))}
        </ButtonGroup>
      ) : (
        <></>
      )}
      {mode === "BILL" ? (
        <div
          className="addIcon"
          onClick={() => {
            if (items.length < 6)
              setItems([
                ...items,
                {
                  qty: "",
                  desc: "",
                  unit: "",
                  price: "",
                  total: "",
                },
              ]);
          }}
        >
          <Image src={addIcon} alt="add" />
        </div>
      ) : (
        <></>
      )}
      <Button
        className="printIcon"
        onClick={handlePrint}
        disabled={isPrintDisabled}
        style={{
          position: "fixed",
          right: 0,
          bottom: "30px",
          margin: "20px",
          cursor: "pointer",
          background: "#cfd4d8",
          borderRadius: "50%",
          height: "60px",
          width: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#616161",
          fontSize: "20px",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",
        }}
      >
        <Image src={printIcon} alt="add" />
      </Button>
      <div
        className={
          mode === "BILL" ? "invoiceWrapperBill" : "invoiceWrapperBlanc"
        }
      >
        {mode === "BLANC" ? (
          <>
            <TextField
              id="outlined-basic"
              variant="standard"
              placeholder="...Adresse / Tél"
              // make it borderless
              InputProps={{
                disableUnderline: true,
              }}
              multiline
              rows={4}
              className="textNote"
              onChange={(e) => setHeadText(e.target.value)}
              value={headText}
            />
            <TextField
              id="docTitle"
              variant="standard"
              placeholder="Titre de document"
              size="medium"
              InputProps={{
                disableUnderline: true,
                className: "textTitle",
              }}
              onChange={(e) => setTitleText(e.target.value)}
              value={titleText}
            />
            <TextField
              id="doccontent"
              variant="standard"
              placeholder="Contenu de document..."
              size="medium"
              InputProps={{
                disableUnderline: true,
              }}
              className="textBody"
              multiline
              onChange={(e) => setBodyText(e.target.value)}
              value={bodyText}
            />
          </>
        ) : (
          <>
            <h2 className="billInvoiceTitle">Invoice</h2>
            <div className="invoiceHeader">
              <p className="invoiceHeaderBg"></p>
              <div className="invoiceHeaderInputUid">
                <p>Number #</p>
                <TextField
                  id="uid"
                  variant="standard"
                  placeholder="2021XXXXX"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "22px", fontWeight: "bold" },
                  }}
                />
              </div>
              <div className="invoiceHeaderCustomerInput">
                <p>To :</p>
                <TextField
                  id="uid"
                  variant="standard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ste Foulen Foulani"
                  InputProps={{
                    disableUnderline: true,
                  }}
                  multiline
                  rows={3}
                  sx={{ width: "60%", marginLeft: "-30px", marginTop: "-5px" }}
                />
              </div>
              <div className="invoiceHeaderCustomerDate">
                <p>Date:</p>
                <TextField
                  id="uid"
                  variant="standard"
                  placeholder="7/4/2021"
                  value={
                    dateValue.length === 0
                      ? new Date().toISOString().split("T")[0]
                      : dateValue
                  }
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "18px" },
                  }}
                  onChange={(e) => setDateValue(e.target.value)}
                />
              </div>
            </div>

            <table className="billTable" cellSpacing="0">
              <thead>
                <tr>
                  <th
                    style={{
                      width: 100,
                    }}
                  >
                    QTE
                  </th>
                  <th
                    style={{
                      width: 240,
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      width: 60,
                    }}
                  >
                    Unit
                  </th>
                  <th
                    style={{
                      width: 120,
                    }}
                  >
                    Unit Price
                  </th>

                  <th
                    style={{
                      width: 120,
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className="billTableItems">
              {items.map((item, index) => (
                <div key={index} className="billItem">
                  <div className="billItemQte">
                    <TextField
                      id="qte"
                      variant="standard"
                      placeholder="x"
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          width: "100px",
                          marginTop: "5px",
                        },
                        inputProps: {
                          style: {
                            textAlign: "center",
                            padding: 0,
                            lineHeight: "normal", // Adjust line height if necessary
                          },
                        },
                      }}
                      onChange={(e) => {
                        setItems(
                          items.map((item, i) => {
                            if (i === index) {
                              const updatedItem = {
                                ...item,
                                qty: e.target.value,
                              };
                              updatedItem.total = calculateItemTotal(
                                updatedItem.qty,
                                updatedItem.price
                              );
                              return updatedItem;
                            }
                            return item;
                          })
                        );
                      }}
                      value={item.qty}
                    />
                  </div>
                  <div className="billItemDesc">
                    <TextField
                      id="desc"
                      variant="standard"
                      placeholder="Item name and/or description"
                      InputProps={{
                        disableUnderline: true,
                        inputComponent: TextareaAutosize,
                        inputProps: {
                          minRows: 2,

                          style: {
                            resize: "none",
                            width: 220,
                            fontSize: "16px",
                          },
                        },
                      }}
                      multiline
                      onChange={(e) => {
                        setItems(
                          items.map((item, i) => {
                            if (i === index) {
                              return {
                                ...item,
                                desc: e.target.value,
                              };
                            }
                            return item;
                          })
                        );
                      }}
                      value={item.desc}
                    />
                  </div>
                  <div className="billItemUnit">
                    <TextField
                      id="unit"
                      variant="standard"
                      placeholder="pc"
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          marginTop: "5px",
                          width: "60px",
                        },
                        inputProps: {
                          style: {
                            textAlign: "center",
                            padding: 0,
                          },
                        },
                      }}
                      onChange={(e) => {
                        setItems(
                          items.map((item, i) =>
                            i === index
                              ? { ...item, unit: e.target.value }
                              : item
                          )
                        );
                      }}
                      value={item.unit}
                    />
                  </div>
                  <div className="billItemPrice">
                    <TextField
                      id="price"
                      variant="standard"
                      placeholder={currency.format(0)}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          marginTop: "5px",
                          width: "120px",
                        },
                        inputProps: {
                          style: {
                            textAlign: "center",
                            padding: 0,
                          },
                        },
                      }}
                      onChange={(e) => {
                        setItems(
                          items.map((item, i) => {
                            if (i === index) {
                              const updatedItem = {
                                ...item,
                                price: e.target.value,
                              };
                              updatedItem.total = calculateItemTotal(
                                updatedItem.qty,
                                updatedItem.price
                              );
                              return updatedItem;
                            }
                            return item;
                          })
                        );
                      }}
                      value={item.price}
                    />
                  </div>
                  <div className="billItemAmount">
                    <TextField
                      id="amount"
                      variant="standard"
                      placeholder={currency.format(0)}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          width: "120px",
                          marginTop: "5px",
                        },
                        inputProps: {
                          style: {
                            textAlign: "center",
                            padding: 0,
                          },
                        },
                      }}
                      value={item.total || ""}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="tableFooterMoreInfo">
                <TextField
                  id="moreInfo"
                  variant="standard"
                  placeholder="more info..."
                  InputProps={{
                    disableUnderline: true,
                    style: { padding: "4px", fontSize: "18px" },
                  }}
                  multiline
                  rows={4}
                />
              </div>

              <div className="tableFooterTotals">
                <div className="tableFooterRow no-print">
                  <div className="tableFooterTitle">Total:</div>
                  <div className="tableFooterValue">
                    <TextField
                      id="total"
                      variant="standard"
                      placeholder={currency.format(0)}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          height: "30px",
                        },
                      }}
                      value={Tht}
                      onChange={(e) => {
                        setTht(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="tableFooterRow no-print">
                  <div className="tableFooterTitle">{"Discount (%) :"}</div>
                  <div className="tableFooterValue">
                    <TextField
                      id="discount"
                      variant="standard"
                      placeholder={"0"}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "18px",
                          height: "30px",
                        },
                      }}
                      value={Tva}
                      onChange={(e) => {
                        setTva(e.target.value);
                      }}
                      size="medium"
                    />
                  </div>
                </div>
                <div className="tableFooterRow">
                  <div className="tableFooterTitle totalTtc">Net to pay</div>
                  <div className="tableFooterValue">
                    <TextField
                      id="netToPay"
                      variant="standard"
                      placeholder={currency.format(0)}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: "22px",
                          height: "30px",
                        },
                      }}
                      value={Ttc}
                      onChange={(e) => {
                        setTtc(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="paymentDetails">
              <div>
                <div className="paymentDetailsInfo">
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    className="paymentDetailsInfoTable"
                  >
                    <tbody>
                      <tr>
                        <th>
                          <p>Payment Details</p>
                        </th>
                        <td></td>
                      </tr>
                      <tr>
                        <th>Bank:</th>
                        <td>
                          <TextField
                            id="bank"
                            variant="standard"
                            placeholder="Attijari BANK"
                            InputProps={{
                              disableUnderline: true,
                              style: { height: "20px", width: "250px" },
                            }}
                            value={accountBank}
                            onChange={(e) => {
                              setAccountBank(e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Account Name:</th>
                        <td>
                          <TextField
                            id="accountName"
                            variant="standard"
                            placeholder="Ste HADYL Consult"
                            InputProps={{
                              disableUnderline: true,
                              style: { height: "20px", width: "250px" },
                            }}
                            value={accountName}
                            onChange={(e) => {
                              setAccountName(e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>IBAN:</th>
                        <td>
                          <TextField
                            id="accountNb"
                            variant="standard"
                            placeholder="04034120004048782978"
                            InputProps={{
                              disableUnderline: true,
                              style: { height: "20px", width: "300px" },
                            }}
                            value={accountNb}
                            onChange={(e) => {
                              setAccountNb(e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Swift / BIC</th>
                        <td>
                          <TextField
                            id="accountSwift"
                            variant="standard"
                            placeholder="BSTUTNTT"
                            InputProps={{
                              disableUnderline: true,
                              style: { height: "20px", width: "250px" },
                            }}
                            value={accountSwift}
                            onChange={(e) => {
                              setAccountSwift(e.target.value);
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Image src={stamp} alt="stamp" className="stamp" width={220} />
            </div>
          </>
        )}
        {/*  shared Info */}
        <div className={mode === "BILL" ? "footerInfo" : "footerInfo"}>
          <div>
            <p
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image src={locationIcon} alt="add" width={20} />
              24, Avenue de Madrid. 1002 Tunis |
              <Image src={phone} alt="add" width={20} />
              +216 98 618 994 - +33 6 29 14 16 58
            </p>

            <p>
              <span>SUARL AU CAPITAL DE </span> 5.000 DT <span>- RC: </span>
              B01235012015 <span>- CODE TVA:</span> 1430982ZAM000
            </p>
            <p>
              <span> COMPTE ATTIJARI BANK </span>04034120004048782978
              <span> EUR /</span> 04034120004048759795<span> TND</span>
            </p>
          </div>
          <p>
            <QRCode
              size={256}
              style={{ height: "70px", width: "70px" }}
              value={"+216 98 618 994"}
              viewBox={`0 0 256 256`}
            />
          </p>
        </div>
        <div className="footer">
          <p> SAP Integration - Maintenance - Support</p>
        </div>
      </div>
    </div>
  );
};

export default index;
