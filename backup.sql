--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone_name character varying(100),
    phone_number character varying(20),
    imei_number character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone_name, phone_number, imei_number, created_at) FROM stdin;
1	Lutendo Kone	Samsung Galaxy A52	0726890507	356789104563210	2025-06-27 15:30:50.400792
3	Thabo Modise	Xiaomi Note 14	0712345678	865543219876543	2025-06-27 15:30:50.400792
4	Naledi Mokoena	Huawei P40 Lite	0769876543	864321098765432	2025-06-27 15:30:50.400792
5	Zinhle Ndlovu	Nokia X20	0798765432	356789123456789	2025-06-27 15:30:50.400792
2	Favier Dev	Oppo A40	0741234567	356789104567890	2025-06-27 15:30:50.400792
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, created_at) FROM stdin;
2	Bob Ops	bob@example.com	2025-06-27 15:10:07.693663
3	Ndivho Dev	Ndivho@example.com	2025-06-27 15:12:44.998245
4	Lutendo Ops	Lutendo@example.com	2025-06-27 15:12:44.998245
5	Lutendo Kone	lutendo@example.com	2025-06-27 15:13:58.878896
6	Favier DevOps	favier@example.com	2025-06-27 15:13:58.878896
7	Lutendo Kone	lutendo@example.com	2025-06-30 10:53:53.11379
8	Lutendo Kone	lutendo@example.com	2025-06-30 10:55:25.752198
9	Khali Kone	Khalirendwe@example.com	2025-06-30 11:09:35.677906
10	Lutendo Kone	lutendo@newmail.co@example.com	2025-06-30 11:25:13.207329
11	Lutendo Kone	lutendo@newmailexample.com	2025-06-30 11:25:21.051457
12	Lutendo Kone	alice@example.com	2025-06-30 11:34:39.095132
1	Lutendo Kone	lutendo@example.com	2025-06-30 11:36:09.833817
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

